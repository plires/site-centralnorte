<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Inertia\Inertia;

class DashboardController extends Controller
{
  public function index()
  {
    return Inertia::render('dashboard/clients/Index', [
      'clients' => Client::all()
    ]);
  }
}
