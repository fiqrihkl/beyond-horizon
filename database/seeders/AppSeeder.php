<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AppSeeder extends Seeder
{
    public function run(): void
    {
        // Default Accounts for Testing
        User::updateOrCreate(
            ['email' => 'admin@beyondhorizon.id'],
            [
                'name' => 'Admin Beyond Horizon',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@beyondhorizon.id'],
            [
                'name' => 'User Beyond Horizon',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // Categories
        $categories = [
            ['name' => 'Pernikahan', 'slug' => 'pernikahan', 'icon' => '💍'],
            ['name' => 'Aqiqah', 'slug' => 'aqiqah', 'icon' => '👶'],
            ['name' => 'Khitanan', 'slug' => 'khitanan', 'icon' => '☪️'],
            ['name' => 'Ulang Tahun', 'slug' => 'ulang-tahun', 'icon' => '🎂'],
            ['name' => 'Acara Kantor', 'slug' => 'acara-kantor', 'icon' => '🏢'],
            ['name' => 'Syukuran Pernikahan', 'slug' => 'syukuran-pernikahan', 'icon' => '🕊️'],
        ];

        foreach ($categories as $cat) {
            EventCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // Packages
        $packages = [
            [
                'name' => 'Gratis',
                'price' => 0,
                'features' => json_encode(['Tema Standar', 'Logo Beyond Horizon', 'Foto Terbatas']),
            ],
            [
                'name' => 'Premium',
                'price' => 99000,
                'features' => json_encode(['Tema Custom Mewah', 'Tanpa Logo BH', 'Manajemen Tamu/RSVP', 'Musik Latar']),
            ],
            [
                'name' => 'Emas',
                'price' => 199000,
                'features' => json_encode(['Semua Fitur Premium', 'Domain Custom', 'Dukungan Prioritas', 'Layanan Pembuatan oleh Admin']),
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(['name' => $pkg['name']], $pkg);
        }
    }
}
