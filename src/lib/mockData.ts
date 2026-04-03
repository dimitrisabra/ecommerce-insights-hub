// Random data generation for the analytics dashboard

const firstNames = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Daniel','Lisa','Matthew','Nancy','Anthony','Betty','Mark','Margaret','Donald','Sandra','Steven','Ashley','Andrew','Dorothy','Paul','Kimberly','Joshua','Emily','Kenneth','Donna','Kevin','Michelle','Brian','Carol','George','Amanda','Timothy','Melissa','Ronald','Deborah'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'];
const products = ['Laptop Pro','Wireless Mouse','USB-C Hub','Mechanical Keyboard','Monitor 27"','Webcam HD','Headphones BT','SSD 1TB','RAM 16GB','Graphics Card','Power Supply','CPU Cooler','Gaming Chair','Desk Lamp LED','Tablet 10"','Smartwatch','Phone Case','Screen Protector','Cable Kit','Docking Station'];
const regions = ['North America','Europe','Asia Pacific','Latin America','Middle East','Africa'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  userId: string;
  product: string;
  region: string;
  quantity: number;
  price: number;
  date: string;
}

function generateUsers(): User[] {
  const users: User[] = [];
  const usedEmails = new Set<string>();

  const createUser = (role: 'user' | 'admin', index: number): User => {
    const first = pickRandom(firstNames);
    const last = pickRandom(lastNames);
    let email = `${first.toLowerCase()}.${last.toLowerCase()}${index}@demo.com`;
    while (usedEmails.has(email)) {
      email = `${first.toLowerCase()}.${last.toLowerCase()}${rand(100, 999)}@demo.com`;
    }
    usedEmails.add(email);
    const daysAgo = rand(30, 365);
    const created = new Date(Date.now() - daysAgo * 86400000);
    return {
      id: `u-${String(index).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email,
      password: `pass${rand(1000, 9999)}`,
      role,
      createdAt: created.toISOString().split('T')[0],
    };
  };

  for (let i = 0; i < 50; i++) users.push(createUser('user', i));
  for (let i = 50; i < 60; i++) users.push(createUser('admin', i));
  return users;
}

function generateSales(users: User[]): SaleRecord[] {
  const sales: SaleRecord[] = [];
  let id = 0;
  const userIds = users.filter(u => u.role === 'user').map(u => u.id);
  
  for (let i = 0; i < 500; i++) {
    const daysAgo = rand(0, 365);
    const date = new Date(Date.now() - daysAgo * 86400000);
    const product = pickRandom(products);
    const basePrice = products.indexOf(product) * 15 + 20;
    sales.push({
      id: `s-${String(id++).padStart(4, '0')}`,
      userId: pickRandom(userIds),
      product,
      region: pickRandom(regions),
      quantity: rand(1, 20),
      price: Math.round((basePrice + rand(-10, 30)) * 100) / 100,
      date: date.toISOString().split('T')[0],
    });
  }
  return sales.sort((a, b) => a.date.localeCompare(b.date));
}

// Singleton store
let _users: User[] | null = null;
let _sales: SaleRecord[] | null = null;

export function getUsers(): User[] {
  if (!_users) _users = generateUsers();
  return _users;
}

export function getSales(): SaleRecord[] {
  if (!_sales) _sales = generateSales(getUsers());
  return _sales;
}

export function getUserSales(userId: string): SaleRecord[] {
  return getSales().filter(s => s.userId === userId);
}

export function addSale(sale: Omit<SaleRecord, 'id'>): SaleRecord {
  const sales = getSales();
  const newSale = { ...sale, id: `s-${String(sales.length).padStart(4, '0')}` };
  sales.push(newSale);
  return newSale;
}

export function deleteSale(id: string) {
  const sales = getSales();
  const idx = sales.findIndex(s => s.id === id);
  if (idx !== -1) sales.splice(idx, 1);
}

export function deleteUser(id: string) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) users.splice(idx, 1);
}

export function getProducts() { return products; }
export function getRegions() { return regions; }

// Generate forecast data (simple moving average + trend)
export function generateForecast(sales: SaleRecord[], months: number = 3) {
  const monthlySales: Record<string, number> = {};
  sales.forEach(s => {
    const month = s.date.substring(0, 7);
    monthlySales[month] = (monthlySales[month] || 0) + s.quantity * s.price;
  });
  
  const sorted = Object.entries(monthlySales).sort(([a], [b]) => a.localeCompare(b));
  const values = sorted.map(([, v]) => v);
  
  // Simple linear regression for trend
  const n = values.length;
  if (n < 2) return { historical: sorted, forecast: [] };
  
  const avgX = (n - 1) / 2;
  const avgY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  values.forEach((y, x) => { num += (x - avgX) * (y - avgY); den += (x - avgX) ** 2; });
  const slope = den ? num / den : 0;
  const intercept = avgY - slope * avgX;
  
  const forecast: [string, number][] = [];
  const lastDate = new Date(sorted[sorted.length - 1][0] + '-01');
  for (let i = 1; i <= months; i++) {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + i);
    const month = d.toISOString().substring(0, 7);
    const predicted = Math.max(0, intercept + slope * (n - 1 + i) + (Math.random() - 0.5) * avgY * 0.1);
    forecast.push([month, Math.round(predicted)]);
  }
  
  return { historical: sorted, forecast };
}
