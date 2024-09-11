import { INestApplication, ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';
import TestAgent from 'supertest/lib/agent';
import { clearAndStoreDummyData } from './fixtures/createTestData.fixtures';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from '../src/attendance/attendance.module';
import * as supertest from 'supertest';
import { adminUserDocument, staffUserDocument, studentUserDocument } from './seeds/users.seed';
import { BRANCH_NAME_TYPE } from './seeds/branch.seed';
import { User } from '../src/users/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from '../src/attendance/dtos';
import { getBearerString } from './fixtures/helper.fixtures';
import { attendanceData } from './seeds/attendance.seed';

describe('AttendanceController (e2e)', () => {
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
        await clearAndStoreDummyData(true);
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
            imports: [AttendanceModule, ConfigModule.forRoot({ envFilePath: '.env.test.local', isGlobal: true }), MongooseModule.forRoot(databaseURI)],
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
    const staffUser = staffUserDocument as Record<BRANCH_NAME_TYPE, User[]>;
    const adminUser = adminUserDocument as User;
    const studentUser = studentUserDocument as Record<BRANCH_NAME_TYPE, User[]>;

    describe('GET /attendance/absentList', () => {
        const route = '/attendance/absentList';
        const query: GetAbsentStudentsListDTO = {
            date: '2024-09-02',
        };

        it('should return attendance record to admin user', () => {
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

        it('should return attendance record to staff user', () => {
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

        it('should return attendance record to student user', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).query(query).expect(403);
        });
    });

    describe('GET /attendance/attendancePercentage', () => {
        const route = '/attendance/attendancePercentage';
        const query: GetAttendancePercentageDTO = {
            percentage: 80,
        };

        it('should return attendance record to admin user', () => {
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

        it('should return attendance record to staff user', () => {
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

        it('should return attendance record to student user', () => {
            return request.get(route).set(AUTH, getBearerString(studentUser.CE[0])).query(query).expect(403);
        });
    });

    describe('POST /attendance', () => {
        afterAll(async () => {
            await clearAndStoreDummyData(true);
        });

        const route = '/attendance';
        const allSuccessAttendanceData: AttendanceDTO[] = [
            {
                date: '2024-09-04',
                studentId: studentUserDocument.CE[0]._id,
            },
            {
                date: '2024-09-04',
                studentId: studentUserDocument.CE[1]._id,
                present: true,
            },
        ];

        const halfSuccessAttendanceData: AttendanceDTO[] = [
            {
                date: '2024-09-11',
                studentId: studentUserDocument.CE[0]._id,
            },
            {
                date: '2024-09-01',
                studentId: studentUserDocument.CE[1]._id,
                present: true,
            },
        ];

        const noSuccessAttendanceData: AttendanceDTO[] = [
            {
                date: '2024-09-01',
                studentId: studentUserDocument.CE[0]._id,
            },
            {
                date: '2024-09-01',
                studentId: studentUserDocument.CE[0]._id,
                present: true,
            },
        ];

        it('should push all the attendance', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send(allSuccessAttendanceData)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('successRecords')
                    expect(res.body.successRecords.length).toEqual(2)
                    expect(res.body).not.toHaveProperty('failedRecords')
                });
        });
        
        it('should push half the attendance', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send(halfSuccessAttendanceData)
                .expect(207)
                .expect((res) => {
                    expect(res.body).toHaveProperty('successRecords')
                    expect(res.body.successRecords.length).toEqual(1)
                    expect(res.body).toHaveProperty('failedRecords')
                    expect(res.body.failedRecords.length).toEqual(1)
                });
        });
        
        it('should not push all the attendance', () => {
            return request
                .post(route)
                .set(AUTH, getBearerString(adminUser))
                .send(noSuccessAttendanceData)
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('successRecords')
                    expect(res.body.successRecords.length).toEqual(0)
                    expect(res.body).toHaveProperty('failedRecords')
                    expect(res.body.failedRecords.length).toEqual(2)
                });
        });
    });

    describe('PUT /attendance', () => {
        afterAll(async () => {
            await clearAndStoreDummyData(true)
        })
        
        const route = '/attendance'
        const editAttendance : AttendanceDTO = {
            date : '2024-09-01',
            studentId : studentUserDocument.CE[0]._id, 
            present : false
        }
        const notFoundAttendance : AttendanceDTO = {
            date : '2024-08-01',
            studentId : studentUserDocument.CE[0]._id, 
            present : false
        }

        it('should edit the attendance', () => {
            return request.put(route).set(AUTH, getBearerString(adminUser)).send(editAttendance).expect(200).expect(res => {
                expect(res.body).toBeDefined()
            })
        })

        it('should return 404 not found attendance', () => {
            return request.put(route).set(AUTH, getBearerString(adminUser)).send(notFoundAttendance).expect(404)
        })

        it('should return 403 when student access the attendance', () => {
            return request.put(route).set(AUTH, getBearerString(studentUser.CE[0])).send(editAttendance).expect(403)
        })
    });

    describe('DELETE /attendance', () => {
        afterAll(async () => {
            await clearAndStoreDummyData(true)
        })
        
        const route = '/attendance'
        const deleteAttendance : AttendanceDTO = {
            date : '2024-09-01',
            studentId : studentUserDocument.CE[0]._id, 
            present : false
        }
        const notFoundAttendance : AttendanceDTO = {
            date : '2024-08-01',
            studentId : studentUserDocument.CE[0]._id, 
            present : false
        }

        it('should delete the attendance', () => {
            return request.delete(route).set(AUTH, getBearerString(adminUser)).send(deleteAttendance).expect(200).expect(res => {
                expect(res.body).toBeDefined()
            })
        })

        it('should return 404 not found attendance', () => {
            return request.delete(route).set(AUTH, getBearerString(adminUser)).send(notFoundAttendance).expect(404)
        })

        it('should return 403 when student access the attendance', () => {
            return request.delete(route).set(AUTH, getBearerString(studentUser.CE[0])).send(notFoundAttendance).expect(403)
        })
    });
});
