// @ts-nocheck
// Example TypeScript File for Testing Block Select Extension

// ==================== Imports ====================
import React, { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";

// ==================== Enums ====================
enum Color {
  Red,
  Green,
  Blue,
}

// ==================== Type Aliases ====================
type ID = string | number;
type Callback = (id: ID) => void;
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// ==================== Interfaces ====================
interface User {
  id: ID;
  name: string;
  email?: string;
  roles: string[];
}

interface Admin extends User {
  permissions: string[];
}

// ==================== Classes ====================
@Decorator
class Person implements User {
  id: ID;
  name: string;
  email?: string;
  roles: string[];

  constructor(id: ID, name: string, roles: string[]) {
    this.id = id;
    this.name = name;
    this.roles = roles;
  }

  @MethodDecorator
  greet(): string {
    return `Hello, my name is ${this.name}`;
  }
}

// ==================== Namespaces and Modules ====================
namespace Utils {
  export function log(message: string): void {
    console.log(message);
  }
}

module Services {
  export class ApiService {
    fetchData(): Promise<any> {
      return fetch("/api/data").then((response) => response.json());
    }
  }
}

// ==================== Functions ====================
function add(a: number, b: number): number {
  return a + b;
}

const subtract = (a: number, b: number): number => a - b;

async function* generateNumbers(): AsyncGenerator<number> {
  let i = 0;
  while (i < 5) {
    yield i++;
  }
}

// ==================== Control Flow ====================
if (true) {
  console.log("This is an if statement");
} else {
  console.log("This is an else clause");
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}

for (const key in { a: 1, b: 2 }) {
  console.log(key);
}

for ( const value of [1, 2, 3]) {
  console.log(value);
}

while (false) {
  // This won't run
}

do {
  // This will run at least once
} while (false);

switch (Color.Red) {
  case Color.Green:
    console.log("Green");
    break;
  case Color.Blue:
    console.log("Blue");
    break;
  default:
    console.log("Red or unknown");
    
}

try {
  throw new Error("Something went wrong");
} catch (error) {
  console.error(error);
} finally {
  console.log("Finally block");
}

// ==================== Template Strings and Regular Expressions ====================
const greeting: string = `Hello, ${"World"}!`;
const regex: RegExp = /abc\d+/;

// ==================== Type Annotations and Predicates ====================
function isString(value: unknown): value is string {
  return typeof value === "string";
}

type ResponseType = typeof fetch;

// ==================== Conditional Expressions ====================
const status = count > 5 ? "High" : "Low";

// ==================== Type Parameters and Arguments ====================
function identity<T>(arg: T): T {
  test(...arr)
  return arg;
}

const result = identity<string>("TypeScript");

// ==================== Intersection and Union Types ====================
type AdminUser = User & { admin: boolean };
type Response = User | AdminUser;

// ==================== Generics with Type Queries ====================
type Keys = keyof User;
type UserType = typeof Person;

// ==================== End of Example ====================
