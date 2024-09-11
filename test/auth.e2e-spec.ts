import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { adminUserDocument, staffUserDocument } from './seeds/users.seed';
import { User } from '../src/users/users.schema';
import { clearAndStoreDummyData } from './fixtures/createTestData.fixtures';
import mongoose from 'mongoose';
import TestAgent from 'supertest/lib/agent';
import { BRANCH_NAME_TYPE } from './seeds/branch.seed';
import { getBearerString } from './fixtures/helper.fixtures';

// Load environment variables from .env.test.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test.local' });

describe('AuthController (e2e)', () => {
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
        await app.close()
    });

    /**
     * Dependency Injection of auth module
     */
    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule, ConfigModule.forRoot({ envFilePath: '.env.test.local', isGlobal: true }), MongooseModule.forRoot(databaseURI)],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        request = supertest(app.getHttpServer());
    });

    /**
     * Constants
     */
    const AUTH = 'Authorization';
    const PASSWORD = 'kevit@123';
    const staffUser = staffUserDocument as Record<BRANCH_NAME_TYPE, User[]>;
    const adminUser = adminUserDocument as User;

    describe('POST /auth/login', () => {
        it('200 (should return JWT token)', () => {
            return request
                .post('/auth/login')
                .send({ email: adminUser.email, password: PASSWORD })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('token');
                });
        });

        it('404 (user not found)', () => {
            return request
                .post('/auth/login')
                .send({ email: adminUser.email + 'extra', password: PASSWORD })
                .expect(404)
                .expect((res) => {
                    expect(res.body).not.toHaveProperty('token');
                });
        });

        it('400 (password not match)', () => {
            return request
                .post('/auth/login')
                .send({ email: adminUser.email, password: 'wrong_pass' })
                .expect(400)
                .expect((res) => {
                    expect(res.body).not.toHaveProperty('token');
                });
        });
    });

    describe('POST /auth/logout', () => {
        // bellow line gives error of undefined so cant be used because before each runs and request might not be defined their so
        // DONT USE -> const route = request.post('/auth/logout');
        const route = '/auth/logout';
        it('200 (should logout single user)', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(staffUser.CE[0]))
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('200 (should logout all user tokens)', () => {
            // console.log(getBearerString(adminUser));

            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send({ all: true })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('401 (password not match)', () => {
            return request
                .post(route)
                .set(AUTH, 'This is a wrong token')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });
    });
});
