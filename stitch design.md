<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Formula Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --sidebar-width: 256px;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #F8FAFC;
        }
        .material-icons {
            font-size: 20px;
        }
    </style>
</head>
<body class="flex bg-gray-50/50">
<aside class="w-[var(--sidebar-width)] bg-white flex flex-col h-screen fixed top-0 left-0 border-r border-gray-200">
<div class="px-6 h-16 flex items-center border-b border-gray-200">
<h1 class="text-xl font-bold text-gray-800">FORMULA <span class="text-sm font-normal text-gray-500">v3.0</span></h1>
</div>
<nav class="flex-1 pt-4 space-y-1">
<a class="flex items-center px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg mx-2" href="#">
<span class="material-icons mr-4">dashboard</span>
<span class="text-sm font-medium">Dashboard</span>
</a>
<div class="mx-2" x-data="{ open: true }">
<button @click="open = !open" class="w-full flex items-center justify-between px-4 py-2.5 text-gray-800 bg-gray-100 rounded-lg">
<div class="flex items-center">
<span class="material-icons mr-4">folder_open</span>
<span class="text-sm font-semibold">Projects</span>
</div>
<span :class="{'rotate-90': open}" class="material-icons text-gray-500 transition-transform">chevron_right</span>
</button>
<div class="pt-2 pl-6 space-y-1" x-show="open">
<a class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" href="#">Scope Management</a>
<a class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" href="#">Shop Drawings</a>
<a class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" href="#">Material Specs</a>
<a class="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" href="#">Tasks</a>
</div>
</div>
</nav>
<div class="p-4 border-t border-gray-200">
<div class="flex items-center">
<div class="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">
                KT
            </div>
<div>
<p class="font-semibold text-sm text-gray-800">Kerem Test</p>
<p class="text-xs text-gray-500">Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 ml-[var(--sidebar-width)] p-8">
<header class="flex items-center justify-between mb-8">
<div>
<div class="flex items-center text-sm text-gray-500">
<span>Projects</span>
<span class="material-icons text-sm mx-1">chevron_right</span>
<span class="text-gray-800 font-medium">Formula Inc. Headquarters</span>
</div>
<h2 class="text-2xl font-bold text-gray-900 mt-1">Overview</h2>
</div>
<div class="flex items-center space-x-2">
<button class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center">
<span class="material-icons mr-2 text-sm">share</span> Share
            </button>
<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center">
<span class="material-icons mr-2 text-sm">add</span> Create Task
            </button>
</div>
</header>
<div class="mb-8">
<nav class="flex items-center border-b border-gray-200">
<a class="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600" href="#">Overview</a>
<a class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800" href="#">Scope <span class="ml-2 bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">0</span></a>
<a class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800" href="#">Drawings <span class="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">2</span></a>
<a class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800" href="#">Materials <span class="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">1</span></a>
<a class="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800" href="#">Tasks <span class="ml-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">3</span></a>
</nav>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
<div class="flex justify-between items-start">
<h3 class="font-medium text-gray-600 text-sm">Scope Items</h3>
<span class="material-icons text-blue-500 bg-blue-100 p-2 rounded-lg">assignment</span>
</div>
<p class="text-3xl font-bold text-gray-900 mt-4">0</p>
<p class="text-xs text-gray-500 mt-1">No items defined</p>
</div>
<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
<div class="flex justify-between items-start">
<h3 class="font-medium text-gray-600 text-sm">Shop Drawings</h3>
<span class="material-icons text-green-500 bg-green-100 p-2 rounded-lg">draw</span>
</div>
<p class="text-3xl font-bold text-gray-900 mt-4">2</p>
<p class="text-xs text-gray-500 mt-1"><span class="font-semibold text-green-600">1 Approved</span>, 1 Pending</p>
</div>
<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
<div class="flex justify-between items-start">
<h3 class="font-medium text-gray-600 text-sm">Tasks</h3>
<span class="material-icons text-purple-500 bg-purple-100 p-2 rounded-lg">task_alt</span>
</div>
<p class="text-3xl font-bold text-gray-900 mt-4">3</p>
<p class="text-xs text-gray-500 mt-1"><span class="font-semibold text-red-600">1 Overdue</span>, 2 In Progress</p>
</div>
<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
<div class="flex justify-between items-start">
<h3 class="font-medium text-gray-600 text-sm">Materials</h3>
<span class="material-icons text-orange-500 bg-orange-100 p-2 rounded-lg">inventory_2</span>
</div>
<p class="text-3xl font-bold text-gray-900 mt-4">1</p>
<p class="text-xs text-gray-500 mt-1">Delivery expected soon</p>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
<div class="flex justify-between items-center mb-5">
<h3 class="font-semibold text-gray-800">Recent Activity</h3>
<button class="text-sm font-medium text-indigo-600 hover:text-indigo-800">View all</button>
</div>
<div class="text-center py-16">
<div class="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
<span class="material-icons text-gray-400" style="font-size: 32px;">work_history</span>
</div>
<h4 class="mt-4 text-base font-medium text-gray-900">No recent activity</h4>
<p class="mt-1 text-sm text-gray-500">Activity will appear here as the team works on this project.</p>
</div>
</div>
<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
<h3 class="font-semibold text-gray-800 mb-5">Quick Actions</h3>
<div class="space-y-3">
<button class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
<span class="material-icons text-blue-600 mr-3">add_circle_outline</span>
<span class="font-medium text-sm text-gray-700">Add Scope Item</span>
</button>
<button class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
<span class="material-icons text-green-600 mr-3">upload_file</span>
<span class="font-medium text-sm text-gray-700">Upload Drawing</span>
</button>
<button class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
<span class="material-icons text-purple-600 mr-3">add_task</span>
<span class="font-medium text-sm text-gray-700">Create Task</span>
</button>
</div>
</div>
</div>
</main>
<script defer="" src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js"></script>

</body></html>