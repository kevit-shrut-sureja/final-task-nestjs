import { INestApplication, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import TestAgent from 'supertest/lib/agent';
import { clearAndStoreDummyData } from './fixtures/createTestData.fixtures';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as supertest from 'supertest';
import { BRANCH_NAME_TYPE, branchDataDocument } from './seeds/branch.seed';
import { BranchDocument } from '../src/branch/branch.schema';
import { User } from '../src/users/users.schema';
import { adminUserDocument, staffUserDocument, studentUserDocument } from './seeds/users.seed';
import { CreateUserDTO, GetUsersQueryDTO, UpdateUserDTO, VacantSeatQueryDTO } from '../src/users/dtos';
import { ROLE } from '../src/constants';
import { getBearerString } from './fixtures/helper.fixtures';

describe('UsersController (e2e)', () => {
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
            imports: [UsersModule, ConfigModule.forRoot({ envFilePath: '.env.test.local', isGlobal: true }), MongooseModule.forRoot(databaseURI)],
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
    const PASSWORD = 'kevit@123';
    const PHONE = '1234567890';

    describe('POST /users', () => {
        afterEach(async () => {
            await clearAndStoreDummyData();
        });

        const studentUserDummy: CreateUserDTO = {
            email: 'student-test@email.com',
            name: 'student-test',
            password: PASSWORD,
            role: ROLE.STUDENT,
            branchId: branchDataDocument.IT._id,
            phone: PHONE,
            currentSemester: 6,
        };

        const staffUserDummy: CreateUserDTO = {
            email: 'staff-test@email.com',
            name: 'staff-test',
            password: PASSWORD,
            role: ROLE.STAFF,
            branchId: branchDataDocument.IT._id,
        };
        const route = '/users';

        it('should create a new student user with admin', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send(studentUserDummy)
                .expect(201)
                .expect((res) => {
                    expect((res.body as User).email).toBe(studentUserDummy.email);
                });
        });

        it('should not create a new student user when the if totalstudentcount get crossed', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .send({ ...studentUserDummy, branchId: branchDataDocument.CE._id })
                .expect(409);
        });

        it('student cannot create any user data', () => {
            return request.post(route).set(AUTH, getBearerString(studentUser.CE[0])).send(staffUserDummy).expect(403);
        });
    });

    describe('GET /users', () => {
        const query: GetUsersQueryDTO = {
            sortBy: 'role',
            skip: '0',
            limit: '10',
            matchingBy: 'student',
            order: 'asce',
        };

        const route = '/users';
        it('should return data to the admin user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(adminUser))
                .query(query)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });
        it('should return data to the staff user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .query(query)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });
        it('should not return data to the student user', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).query(query).expect(403);
        });
    });

    describe('GET /users/analysis/batch', () => {
        const route = '/users/analysis/batch';
        it('should return data to the admin user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(adminUser))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });

        it('should return data to the staff user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });

        it('should not return data to the student user', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).expect(403);
        });
    });

    describe('GET /users/analysis/vacantSeats', () => {
        const query: VacantSeatQueryDTO = {
            branchName: 'CE',
            batch: 2022,
        };

        const route = '/users/analysis/vacantSeats';
        it('should return data to the admin user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(adminUser))
                .query(query)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });

        it('should return data to the staff user', () => {
            return request
                .get(route)
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .query(query)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                    expect(res.body.length).toBeGreaterThanOrEqual(1);
                });
        });

        it('should not return data to the student user', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).query(query).expect(403);
        });
    });

    describe('GET /users/:id', () => {
        const route = (id: string) => `/users/${id}`;

        it('should return user details to admin', () => {
            return request
                .get(route(studentUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(adminUser))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                });
        });

        it('should return student details to staff from same branch', () => {
            return request
                .get(route(studentUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                });
        });

        it('should not return staff details to staff from members', () => {
            return request.get(route(staffUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(staffUser.IT[0])).expect(403);
        });

        it('should return student details to staff from other branch', () => {
            return request
                .get(route(studentUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(staffUser.IT[0]))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeDefined();
                });
        });

        it('should not return other student user details to student', () => {
            return request.get(route(studentUserDocument.IT[0]._id.toString())).expect(403).set(AUTH, getBearerString(studentUser.CE[0]));
        });
    });

    describe('DELETE /users/:id', () => {
        const route = (id: string) => `/users/${id}`;

        afterEach(async () => {
            await clearAndStoreDummyData();
        });

        it('should delete any user by admin auth', () => {
            return request.delete(route(studentUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(adminUser)).expect(200);
        });

        it('should delete student user by staff from same branch', () => {
            return request.delete(route(studentUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(staffUser.CE[0])).expect(200);
        });

        it('should not delete student by staff from another branch', () => {
            return request.delete(route(studentUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(staffUser.IT[0])).expect(403);
        });

        it('should not delete any user by student auth', () => {
            return request.delete(route(studentUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(studentUser.IT[0])).expect(403);
        });
    });

    describe('PUT /users/:id', () => {
        afterEach(async () => {
            await clearAndStoreDummyData();
        });
        const route = (id: string) => `/users/${id}`;

        const editStudentUser: UpdateUserDTO = {
            name: 'edited',
        };

        const editStaffUser: UpdateUserDTO = {
            name: 'edited',
        };

        it('should allow admin to edited any user data', () => {
            return request
                .put(route(staffUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(adminUser))
                .send(editStaffUser)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toEqual(editStaffUser.name);
                });
        });

        it('should allow staff to edited any student data', () => {
            return request
                .put(route(studentUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .send(editStudentUser)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toEqual(editStudentUser.name);
                });
        });

        it('should allow student to edited any self data', () => {
            return request
                .put(route(studentUserDocument.CE[0]._id.toString()))
                .set(AUTH, getBearerString(studentUser.CE[0]))
                .send(editStudentUser)
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toEqual(editStudentUser.name);
                });
        });

        it('should not allow student to edited data other than self', () => {
            return request.put(route(studentUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(studentUser.CE[1])).send(editStudentUser).expect(403);
        });

        it('should not allow staff to edited data of other staff', () => {
            return request.put(route(staffUserDocument.CE[0]._id.toString())).set(AUTH, getBearerString(staffUser.CE[1])).send(editStaffUser).expect(403);
        });
    });
});
