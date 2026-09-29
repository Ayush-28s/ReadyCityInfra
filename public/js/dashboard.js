const token = localStorage.getItem('admin_token');

if (!token) {
    window.location.href = 'admin.html';
}

async function api(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`/api/${endpoint}`, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('admin_token');
        window.location.href = 'admin.html';
        return null;
    }
    return res.json();
}

async function loadSection(type) {
    // Update Sidebar Active State
    document.querySelectorAll('aside nav button').forEach(btn => btn.classList.remove('bg-slate-800', 'text-white'));
    document.getElementById(`nav-${type}`)?.classList.add('bg-slate-800', 'text-white');

    document.getElementById('page-title').innerText = type.charAt(0).toUpperCase() + type.slice(1);

    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>';

    try {
        const data = await api(`admin-api?type=${type}`);
        renderContent(type, data);
        lucide.createIcons();
    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-red-500">Error loading data.</div>`;
    }
}

function renderContent(type, data) {
    const content = document.getElementById('content-area');

    if (type === 'stats') {
        const { stats, recentBookings } = data;
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                ${statCard('Total Revenue', '₹' + (stats.revenue?.toLocaleString() || 0), 'trending-up', 'text-green-600', 'bg-green-50')}
                ${statCard('Active Users', stats.users, 'users', 'text-blue-600', 'bg-blue-50')}
                ${statCard('Properties', stats.properties, 'building-2', 'text-purple-600', 'bg-purple-50')}
                ${statCard('Bookings', stats.bookings, 'calendar', 'text-orange-600', 'bg-orange-50')}
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800">Recent Bookings</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 text-gray-500">
                             <tr><th class="px-6 py-3 font-medium">User</th><th class="px-6 py-3 font-medium">Property</th><th class="px-6 py-3 font-medium">Status</th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${recentBookings.map(b => `
                                <tr>
                                    <td class="px-6 py-4 font-medium text-gray-900">${b.full_name}</td>
                                    <td class="px-6 py-4">${b.title}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${b.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    else if (type === 'properties') {
        content.innerHTML = `
            <div class="flex justify-between mb-6">
                <div></div>
                <button onclick="openPropertyModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <i data-lucide="plus" class="w-4 h-4"></i><span>Add Property</span>
                </button>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 text-gray-500">
                         <tr><th class="px-6 py-3">Title</th><th class="px-6 py-3">Price</th><th class="px-6 py-3">Status</th><th class="px-6 py-3">Actions</th></tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${data.map(p => `
                            <tr>
                                <td class="px-6 py-4 font-medium text-gray-900">${p.title}</td>
                                <td class="px-6 py-4">₹${parseFloat(p.price).toLocaleString()}</td>
                                <td class="px-6 py-4">
                                     <span class="px-2 py-1 rounded text-xs font-semibold ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">${p.status}</span>
                                </td>
                                <td class="px-6 py-4 flex space-x-2">
                                     <button onclick="deleteProperty(${p.id})" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    else if (type === 'users' || type === 'leads') {
        // Generic Table Render
        const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== 'password') : [];
        content.innerHTML = `
             <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 text-gray-500"><tr>${keys.map(k => `<th class="px-6 py-3 capitalize">${k.replace('_', ' ')}</th>`).join('')}</tr></thead>
                    <tbody class="divide-y divide-gray-100">
                        ${data.map(row => `<tr>${keys.map(k => `<td class="px-6 py-4 text-gray-700">${row[k] || '-'}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function statCard(title, value, icon, color, bg) {
    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">${title}</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">${value}</p>
                </div>
                <div class="p-3 rounded-full ${bg} ${color}">
                    <i data-lucide="${icon}" class="w-6 h-6"></i>
                </div>
            </div>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('admin_token');
    window.location.href = 'admin.html';
}

function openPropertyModal() {
    document.getElementById('modal-container').classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h3 class="text-xl font-bold mb-4">Add New Property</h3>
        <form onsubmit="createProperty(event)" class="space-y-4">
            <input type="text" name="title" placeholder="Property Title" class="w-full border p-2 rounded" required>
            <input type="number" name="price" placeholder="Price" class="w-full border p-2 rounded" required>
            <input type="text" name="location" placeholder="Location" class="w-full border p-2 rounded" required>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Property</button>
            </div>
        </form>
    `;
}

function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

async function createProperty(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Default values
    data.type = "Plot";
    data.area = "N/A";
    data.image_url = "";
    data.description = "";
    data.map_url = "";

    await api('admin-api', 'POST', { action: 'create', table: 'properties', data });
    closeModal();
    loadSection('properties');
}

async function deleteProperty(id) {
    if (confirm('Delete this property?')) {
        await api('admin-api', 'DELETE', { action: 'delete', table: 'properties', id });
        loadSection('properties');
    }
}

// Init
loadSection('stats');
