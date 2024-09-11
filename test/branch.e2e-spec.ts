import { INestApplication, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import TestAgent from 'supertest/lib/agent';
import * as supertest from 'supertest';
import { clearAndStoreDummyData } from './fixtures/createTestData.fixtures';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchModule } from '../src/branch/branch.module';
import { BRANCH_NAME_TYPE, branchDataDocument } from './seeds/branch.seed';
import { Branch, BranchDocument } from '../src/branch/branch.schema';
import { getBearerString } from './fixtures/helper.fixtures';
import { adminUserDocument, staffUserDocument, studentUserDocument } from './seeds/users.seed';
import { User } from '../src/users/users.schema';
import { CreateBranchDTO, GetBranchQueryDTO } from '../src/branch/dtos';

describe('BranchController (e2e)', () => {
    let app: INestApplication;
    let request: TestAgent;

    /**
     * Mongoose database connection and dummy data setup
     */
    const databaseURI = process.env.MONGODB_URI;

    beforeAll(async () => {
        if (!databaseURI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        await mongoose.connect(databaseURI);
        await mongoose.connection.db.dropDatabase();
        await clearAndStoreDummyData();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await app.close();
    });

    /**
     * Dependency Injection of auth module
     */
    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [BranchModule, ConfigModule.forRoot({ envFilePath: '.env.test.local', isGlobal: true }), MongooseModule.forRoot(databaseURI)],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        );
        await app.init();
        request = supertest(app.getHttpServer());
    });

    /**
     * Constants
     */
    const AUTH = 'Authorization';
    const branchData: Record<BRANCH_NAME_TYPE, BranchDocument> = branchDataDocument;
    const staffUser = staffUserDocument as Record<BRANCH_NAME_TYPE, User[]>;
    const adminUser = adminUserDocument as User;
    const studentUser = studentUserDocument as Record<BRANCH_NAME_TYPE, User[]>;

    describe('GET /branch/:id', () => {
        const route = (id: string) => `/branch/${id}`;

        it('admin should fetch the branch details', () => {
            return request
                .get(route(branchData.CE._id.toString()))
                .set(AUTH, getBearerString(adminUser))
                .expect(200)
                .expect((res) => {
                    expect((res.body as BranchDocument)._id.toString()).toEqual(branchData.CE._id.toString());
                });
        });

        it('staff can fetch branch details', () => {
            return request
                .get(route(branchData.CE._id.toString()))
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .expect(200)
                .expect((res) => {
                    expect((res.body as BranchDocument)._id.toString()).toEqual(branchData.CE._id.toString());
                });
        });

        it('student cannot fetch branch details', () => {
            return request.get(route(branchData.CE._id.toString())).set(AUTH, getBearerString(studentUser.CE[0])).expect(403);
        });

        it('should not fetch non-existing branch', () => {
            return request.get(route(adminUserDocument._id.toString())).set(AUTH, getBearerString(adminUser)).expect(404);
        });
    });

    describe('POST /branch', () => {
        const route = '/branch';
        const newBranch: CreateBranchDTO = {
            batch: 2021,
            name: 'ICT',
            totalStudentsIntake: 5,
        };

        it('admin can create new branch', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send(newBranch)
                .expect(201)
                .expect((res) => {
                    expect((res.body as Branch).name).toEqual((newBranch as Branch).name);
                    expect((res.body as Branch).totalStudentsIntake).toEqual((newBranch as Branch).totalStudentsIntake);
                    expect((res.body as Branch).batch).toEqual((newBranch as Branch).batch);
                });
        });

        it('staff cannot create new branch', () => {
            return request.post(route).set(AUTH, getBearerString(staffUser.CE[0])).send(newBranch).expect(403);
        });

        it('student cannot create new branch', () => {
            return request.post(route).set(AUTH, getBearerString(studentUser.CE[0])).send(newBranch).expect(403);
        });

        it('admin cannot branch with wrong details', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send({ ...newBranch, name: '' })
                .expect(400);
        });
    });

    describe('GET /branch', () => {
        const route = '/branch';
        const branchQuery: GetBranchQueryDTO = {
            limit: 10,
            matchBy: 'CE',
            order: 'asce',
            skip: 0,
            sortBy: 'name',
        };

        it('admin can access branch details', () => {
            return request.get(route).set(AUTH, getBearerString(adminUser)).send(branchQuery).expect(200);
        });

        it('staff can access branch details', () => {
            return request.get(route).set(AUTH, getBearerString(staffUser.CE[0])).send(branchQuery).expect(200);
        });

        it('student cannot access branch details', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).send(branchQuery).expect(403);
        });
    });

    describe('DELETE /branch/:id', () => {
        afterAll(async () => {
            await clearAndStoreDummyData();
        });

        const route = (id) => `/branch/${id}`;
        const branchToBeDeleted: CreateBranchDTO = {
            batch: 2011,
            name: 'custom',
            totalStudentsIntake: 1,
        };

        it('admin can delete a branch with no user', async () => {
            // creating the new dummy branch to be deleted
            const response = await request.post('/branch').set(AUTH, getBearerString(adminUser)).send(branchToBeDeleted).expect(201);
            return request.delete(route(response.body._id)).set(AUTH, getBearerString(adminUser)).expect(200);
        });

        it('admin cannot delete branch with the users having that branch', () => {
            return request.delete(route(branchDataDocument.CE._id.toString())).set(AUTH, getBearerString(adminUser)).expect(409);
        });

        it('staff cannot delete branch', () => {
            return request.delete(route(branchDataDocument.CE._id.toString())).set(AUTH, getBearerString(staffUser.CE[0])).expect(403);
        });

        it('student cannot delete branch', () => {
            return request.delete(route(branchDataDocument.CE._id.toString())).set(AUTH, getBearerString(studentUser.CE[0])).expect(403);
        });
    });

    describe('PUT /branch/:id', () => {
        afterAll(async () => {
            await clearAndStoreDummyData();
        });

        const route = (id) => `/branch/${id}`;
        const branchToBeEdited: CreateBranchDTO = {
            batch: 2011,
            name: 'custom',
            totalStudentsIntake: 1,
        };

        it('admin can edit a branch with no users using it', async () => {
            const editedBatch = 2000;
            // creating the new dummy branch to be edited
            const response = await request.post('/branch').set(AUTH, getBearerString(adminUser)).send(branchToBeEdited).expect(201);
            return request
                .put(route(response.body._id))
                .set(AUTH, getBearerString(adminUser))
                .send({ ...branchToBeEdited, batch: editedBatch })
                .expect(200)
                .expect((res) => {
                    expect((res.body as Branch).batch).toEqual(editedBatch);
                });
        });

        it('admin cannot edit branch with the users having that branch', () => {
            return request
                .put(route(branchDataDocument.CE._id.toString()))
                .set(AUTH, getBearerString(adminUser))
                .send({ ...branchData, batch: 2000 })
                .expect(409);
        });

        it('staff cannot delete branch', () => {
            return request
                .put(route(branchDataDocument.CE._id.toString()))
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .send({ ...branchData, batch: 2000 })
                .expect(403);
        });

        it('student cannot delete branch', () => {
            return request
                .put(route(branchDataDocument.CE._id.toString()))
                .set(AUTH, getBearerString(studentUser.CE[0]))
                .send({ ...branchData, batch: 2000 })
                .expect(403);
        });
    });
});
