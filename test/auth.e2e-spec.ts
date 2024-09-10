import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { adminData } from './seeds/users.seed';
import { User } from '../src/users/users.schema';
import { clearAndStoreDummyData } from './fixtures/createTestData';
import mongoose from 'mongoose';

// Load environment variables from .env.test.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test.local' });

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    /**
     * Mongoose database connection and dummy data setup
     */
    const databaseURI = process.env.MONGODB_URI
    
    beforeAll(async () => {
        if (!databaseURI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        console.log(databaseURI);
        
        await mongoose.connect(databaseURI);
        await mongoose.connection.db.dropDatabase();
        await clearAndStoreDummyData();
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
    });

    /**
     * Dependency Injection of auth module
     */
    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                ConfigModule.forRoot({ envFilePath: '.env.test.local', isGlobal: true }),
                MongooseModule.forRoot(databaseURI),
            ],
        }).compile();
        
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    const password = 'kevit@123';

    describe('POST /auth/login', () => {
        it('200 (should return JWT token)', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: adminData<User>().email, password })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('token');
                });
        });

        it('404 (user not found)', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: adminData<User>().email + 'extra', password })
                .expect(404)
                .expect((res) => {
                    expect(res.body).not.toHaveProperty('token');
                });
        });
        
        it('400 (password not match)', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: adminData<User>().email, password : "wrong_pass"})
                .expect(400)
                .expect((res) => {
                    expect(res.body).not.toHaveProperty('token');
                });
        });
    })
});
