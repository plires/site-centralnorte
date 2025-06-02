<?php

namespace App\Http\Controllers\Dashboard;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {

        $users = User::with('role')
            ->where('id', '!=', Auth::id())
            ->get();
        return inertia('dashboard/users/Index', ['users' => $users]);
    }

    public function create()
    {
        $roles = Role::all();
        return inertia('Dashboard/Users/Create', ['roles' => $roles]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            ...$request->only(['name', 'email', 'role_id']),
            'password' => bcrypt($request->password),
        ]);

        return redirect()->route('dashboard.users.index');
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        return inertia('Dashboard/Users/Edit', [
            'user' => $user->load('role'),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => "required|email|unique:users,email,{$user->id}",
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update($request->only(['name', 'email', 'role_id']));

        return redirect()->route('dashboard.users.index');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back();
    }
}
