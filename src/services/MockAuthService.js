/**
 * Mock Auth Service
 * Simulates server-side authentication, validating payloads,
 * mocking Bcrypt hashing, and generating simulated JWTs.
 */

const DUMMY_DB = {
    workers: [],
    providers: []
};

// Mock Bcrypt Hash
const mockBcryptHash = (password) => {
    return `hashed_${btoa(password)}_salt`;
};

// Mock JWT Sign
const mockJwtSign = (payload) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 3600000 }));
    const signature = "mock_signature_xYzA123";
    return `${header}.${body}.${signature}`;
};

export const registerUser = async (email, password, role) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (password.length < 6) {
                return reject(new Error("Validation Error: Password must be at least 6 characters."));
            }
            
            const hashedPassword = mockBcryptHash(password);
            
            const newUser = { id: Date.now().toString(), email, password: hashedPassword, role };
            
            if (role === 'worker') DUMMY_DB.workers.push(newUser);
            if (role === 'provider') DUMMY_DB.providers.push(newUser);
            
            const token = mockJwtSign({ id: newUser.id, role });
            resolve({ user: { id: newUser.id, email, role }, token });
        }, 800); // simulate network delay
    });
};

export const loginUser = async (email, password, role) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulated DB lookup logic
            const collection = role === 'worker' ? DUMMY_DB.workers : DUMMY_DB.providers;
            const user = collection.find(u => u.email === email);
            
            // Allow mock login for demonstration even if not in DB
            const token = mockJwtSign({ id: user?.id || 'demo_id', role });
            resolve({ user: { id: user?.id || 'demo_id', email, role }, token });
        }, 800);
    });
};
