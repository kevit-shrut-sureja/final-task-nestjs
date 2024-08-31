const baseUrl = 'http://localhost:3000';
const password = 'kevit@123';

async function loginUser(email, password) {
    try {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    } catch (error) {
        console.error(`Error logging in user ${email}:`, error);
        throw error;
    }
}

async function createResource(token, endpoint, data) {
    try {
        const res = await fetch(`${baseUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        console.error(`Error creating resource at ${endpoint}:`, error);
        throw error;
    }
}

async function createUsers(token, users) {
    for (const user of users) {
       const s =  await createResource(token, 'users', user)
       console.log(s)
    }
}

async function createBranches(adminToken, branches) {
    const branchIds = {};
    for (const branch of branches) {
        const res = await createResource(adminToken, 'branch', branch);
        console.log(res);
        branchIds[`${branch.name}-${branch.batch}`] = res._id;
    }
    console.log(branchIds);
    return branchIds;
}

async function main() {
    try {
        // Login as super admin
        const { token: superAdminToken } = await loginUser('super@email.com', password);

        // Create admin users
        const adminUsers = [
            { name: 'admin-1', email: 'admin-1@email.com', password, role: 'admin' },
            { name: 'admin-2', email: 'admin-2@email.com', password, role: 'admin' }
        ];
        await createUsers(superAdminToken, adminUsers);


        // Admin Login
        const { token: adminToken } = await loginUser(adminUsers[0].email, adminUsers[0].password);

        // Create branches
        const branches = [
            { name: 'CE', batch: 2021, totalStudentsIntake: 5 },
            { name: 'IT', batch: 2021, totalStudentsIntake: 5 },
            { name: 'CE', batch: 2022, totalStudentsIntake: 5 },
            { name: 'IT', batch: 2022, totalStudentsIntake: 5 }
        ];
        const branchIds = await createBranches(adminToken, branches);
        const branchNames = Object.keys(branchIds)

        // creating some staff members
        const staff = []
        for (const branch of branchNames) {
            staff.push({
                name: `staff-${branch}`,
                email: `staff-${branch}@email.com`,
                password: password,
                role: 'staff',
                branchId: branchIds[branch]
            })
        }
        await createUsers(adminToken, staff)

        // creating some student in all the different branches, 2 students for every branch
        const students = []
        for (const branch of branchNames) {
            for (let i = 1; i <= 4; i += 1) {
                students.push({
                    name: `student-${branch}-${i}`,
                    email: `student-${branch}-${i}@email.com`,
                    password,
                    role: 'student',
                    branchId: branchIds[branch],
                    phone: '1234567890',
                    currentSemester: Math.floor(Math.random() * 8) + 1
                })
            }
        }
        await createUsers(adminToken, students)

        // creaing attendance for all the students
        console.log('Dummy users created successfully');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        process.exit();
    }
}

main();
