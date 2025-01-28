import LoginForm from "@/components/(public)/(sign-in)";
import { Card } from "@/components/ui/card";
import React from "react";

export default function page() {
  return (
    <div className="h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/tourist-register" className="font-bold hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}