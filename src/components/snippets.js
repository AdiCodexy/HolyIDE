/* snippets.js
   Organized by subject → questions.
   Each question has:
     id, label, filename, language,
     questionText, hints[], testCases[], code
*/

export const SUBJECTS = [
  // ══════════════════════════════════════════════════════════════════
  // PYTHON
  // ══════════════════════════════════════════════════════════════════
  {
    name: "Python",
    questions: [
      {
        id: "py-1",
        label: "Basics & Data Types",
        filename: "python_basics.py",
        language: "Python",
        questionText:
`You are given a list of student dictionaries, each with a "name" and "grade" key.

Your tasks:
  1. Use a list comprehension to get names of students who scored ≥ 80
  2. Build a dict mapping name → grade using a dict comprehension
  3. Unpack a list of (x, y) coordinate tuples and print each point
  4. Compute and print the class average rounded to 1 decimal place

Run the starter code first to see the expected output, then modify it.`,
        hints: [
          "List comprehension: [expr for item in list if condition]",
          "Dict comprehension: {k: v for item in list}",
          "Tuple unpacking in for loop: for x, y in list_of_tuples",
          "f-string formatting: f\"{value:.1f}\" for 1 decimal place",
        ],
        testCases: [
          {
            input: "",
            expected: "Passing: ['Alice', 'Bob']\nGrade Map: {'Alice': 92, 'Bob': 85, 'Carol': 78}\n  Point: (1, 2)\n  Point: (3, 4)\n  Point: (5, 6)\nClass Average: 85.0",
          },
        ],
        code:
`# Python Basics — Data Types & Control Flow
# ─────────────────────────────────────────

# Q1: Working with lists, tuples, and dicts
students = [
    {"name": "Alice", "grade": 92},
    {"name": "Bob",   "grade": 85},
    {"name": "Carol", "grade": 78},
]

# Q2: List comprehension — filter passing students (grade >= 80)
passing = [s["name"] for s in students if s["grade"] >= 80]
print("Passing:", passing)

# Q3: Dictionary comprehension
grade_map = {s["name"]: s["grade"] for s in students}
print("Grade Map:", grade_map)

# Q4: Tuple unpacking
coordinates = [(1, 2), (3, 4), (5, 6)]
for x, y in coordinates:
    print(f"  Point: ({x}, {y})")

# Q5: String formatting
avg = sum(s["grade"] for s in students) / len(students)
print(f"Class Average: {avg:.1f}")
`,
      },

      {
        id: "py-2",
        label: "OOP & Inheritance",
        filename: "python_oop.py",
        language: "Python",
        questionText:
`Implement an object-oriented shape system.

You need to:
  1. Create a base class Shape with a method area() that raises NotImplementedError
  2. Create Circle(radius) and Rectangle(width, height) subclasses that implement area()
  3. Override __repr__ in Shape to return "ClassName(area=X.XX)"
  4. Demonstrate polymorphism by storing shapes in a list and calling area() on each
  5. Compute and print the total area of all shapes

Expected output uses pi = 3.14159... (use math.pi)`,
        hints: [
          "Use super().__init__(name) in subclass constructors",
          "math.pi * r**2 for circle area",
          "Polymorphism: same method name, different behavior per class",
          "sum(s.area() for s in shapes) to total all areas",
        ],
        testCases: [
          {
            input: "",
            expected: "Circle(area=78.54)\nRectangle(area=24.00)\nCircle(area=28.27)\nTotal area: 130.81",
          },
        ],
        code:
`# Python OOP — Classes & Inheritance
# ───────────────────────────────────

class Shape:
    """Base class for geometric shapes."""
    def __init__(self, name):
        self.name = name

    def area(self):
        raise NotImplementedError("Subclass must implement area()")

    def __repr__(self):
        return f"{self.name}(area={self.area():.2f})"


class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2


class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("Rectangle")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height


# Q1: Polymorphism in action
shapes = [Circle(5), Rectangle(4, 6), Circle(3)]
for s in shapes:
    print(s)

# Q2: Total area
total = sum(s.area() for s in shapes)
print(f"Total area: {total:.2f}")
`,
      },

      {
        id: "py-3",
        label: "Functions & Recursion",
        filename: "py_functions.py",
        language: "Python",
        questionText:
`Practice writing and calling Python functions including recursive ones.

Tasks:
  1. Write is_prime(n) → returns True if n is prime, False otherwise
     - n ≤ 1 is NOT prime
     - Check divisors only up to √n for efficiency
  2. Write factorial(n) recursively → n! where 0! = 1
  3. Write fibonacci(n) recursively → nth Fibonacci number (0-indexed)
     - fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2 ...

Read the test cases below to know the exact expected output.`,
        hints: [
          "For is_prime: loop i from 2 to int(n**0.5)+1",
          "Recursive factorial: return n * factorial(n-1), base case n==0 returns 1",
          "Recursive fibonacci: return fib(n-1) + fib(n-2), base cases 0 and 1",
          "Use int(n**0.5) + 1 as the range stop for prime check",
        ],
        testCases: [
          {
            input: "",
            expected: "is_prime(7) = True\nis_prime(10) = False\nis_prime(1) = False\nfactorial(5) = 120\nfactorial(0) = 1\nfibonacci(7) = 13",
          },
        ],
        code:
`# Python — Functions & Recursion
# ───────────────────────────────

def is_prime(n):
    # TODO: return True if n is prime, False otherwise
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True


def factorial(n):
    # TODO: recursive factorial
    if n == 0:
        return 1
    return n * factorial(n - 1)


def fibonacci(n):
    # TODO: recursive fibonacci (0-indexed)
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


# ── Test your functions ──────────────────
print(f"is_prime(7) = {is_prime(7)}")
print(f"is_prime(10) = {is_prime(10)}")
print(f"is_prime(1) = {is_prime(1)}")
print(f"factorial(5) = {factorial(5)}")
print(f"factorial(0) = {factorial(0)}")
print(f"fibonacci(7) = {fibonacci(7)}")
`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PDSA
  // ══════════════════════════════════════════════════════════════════
  {
    name: "PDSA",
    questions: [
      {
        id: "pdsa-1",
        label: "BFS & Shortest Path",
        filename: "pdsa_bfs.py",
        language: "Python",
        questionText:
`Implement Breadth-First Search (BFS) on an undirected graph.

Given the adjacency list below, write bfs(graph, start) that:
  - Visits nodes level by level using a queue
  - Returns a list of nodes in BFS traversal order
  - Does NOT revisit nodes

The graph has 6 nodes: A B C D E F
Starting from "A", the BFS order should be: ['A', 'B', 'C', 'D', 'E', 'F']

Key insight: BFS uses a queue (FIFO) — use collections.deque for O(1) popleft().`,
        hints: [
          "Use collections.deque as your queue — queue.append() to add, queue.popleft() to remove",
          "Keep a visited set to avoid cycles",
          "Initialize: visited = set(), queue = deque([start])",
          "For each node popped, add its unvisited neighbours to the queue",
        ],
        testCases: [
          { input: "", expected: "['A', 'B', 'C', 'D', 'E', 'F']" },
        ],
        code:
`# PDSA — BFS & Shortest Path
# ────────────────────────────

from collections import deque

def bfs(graph, start):
    """Return BFS traversal order from 'start'."""
    visited = set()
    queue   = deque([start])
    order   = []

    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                queue.append(neighbour)

    return order


graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}

print(bfs(graph, "A"))
`,
      },

      {
        id: "pdsa-2",
        label: "DP — LCS & Knapsack",
        filename: "pdsa_dp.py",
        language: "Python",
        questionText:
`Implement two classic Dynamic Programming algorithms.

Problem 1 — Longest Common Subsequence (LCS):
  Given strings a and b, return the length of their LCS.
  LCS("ABCBDAB", "BDCAB") = 4
  Approach: Build a 2D DP table dp[i][j] = LCS of a[:i] and b[:j]

Problem 2 — 0/1 Knapsack:
  Given weights[], values[], and a capacity,
  find the maximum value you can carry without exceeding capacity.
  knapsack([2,3,4,5], [3,4,5,6], 8) = 10
  Approach: dp[i][w] = best value using first i items with weight limit w`,
        hints: [
          "LCS: if a[i-1]==b[j-1], dp[i][j] = dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1])",
          "Knapsack: for each item, either skip it or take it (if weight fits)",
          "Both tables are (n+1) × (m+1) to handle 0-index base cases easily",
          "Final answer: dp[m][n] for LCS, dp[n][capacity] for knapsack",
        ],
        testCases: [
          { input: "", expected: "4\n10" },
        ],
        code:
`# PDSA — Dynamic Programming
# ────────────────────────────

def lcs(a, b):
    """Longest Common Subsequence — O(mn) DP."""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]


def knapsack(weights, values, capacity):
    """0/1 Knapsack — O(n * W) DP."""
    n  = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])

    return dp[n][capacity]


print(lcs("ABCBDAB", "BDCAB"))
print(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 8))
`,
      },

      {
        id: "pdsa-3",
        label: "Sorting Algorithms",
        filename: "pdsa_sorting.py",
        language: "Python",
        questionText:
`Implement two fundamental sorting algorithms from scratch.

Merge Sort:
  - Divide the array in half recursively until size ≤ 1
  - Merge two sorted halves by comparing elements
  - Time: O(n log n) | Space: O(n)

Quick Sort:
  - Pick a pivot (use middle element)
  - Partition into [less than pivot] + [equal] + [greater]
  - Recursively sort each partition
  - Time: O(n log n) average | Space: O(log n)

Both should sort [38, 27, 43, 3, 9, 82, 10] to [3, 9, 10, 27, 38, 43, 82]`,
        hints: [
          "Merge sort base case: if len(arr) <= 1: return arr",
          "For merge: use two pointers i, j stepping through left/right",
          "Quick sort: left = [x for x in arr if x < pivot]",
          "Quick sort returns quick_sort(left) + mid + quick_sort(right)",
        ],
        testCases: [
          {
            input: "",
            expected: "Merge Sort: [3, 9, 10, 27, 38, 43, 82]\nQuick Sort: [3, 9, 10, 27, 38, 43, 82]",
          },
        ],
        code:
`# PDSA — Sorting Algorithms
# ──────────────────────────

def merge_sort(arr):
    """Merge Sort — O(n log n) stable sort."""
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def quick_sort(arr):
    """Quick Sort — O(n log n) average."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left  = [x for x in arr if x < pivot]
    mid   = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)


data = [38, 27, 43, 3, 9, 82, 10]
print("Merge Sort:", merge_sort(data))
print("Quick Sort:", quick_sort(data))
`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // JAVA  (10-step learning path)
  // ══════════════════════════════════════════════════════════════════
  {
    name: "Java",
    questions: [
      {
        id: "java-01",
        label: "01 · Hello World & Output",
        filename: "J01_HelloWorld.java",
        language: "Java",
        questionText:
`Every Java program needs a public class whose name matches the filename, and a main() method.

Your tasks:
  1. Print "Hello, World!" using System.out.println()
  2. Declare an int variable version = 25
  3. Print "Java version: 25" using System.out.printf() with %d format

The output must match EXACTLY — check spacing and capitalization!`,
        hints: [
          "System.out.println() adds a newline at the end automatically",
          "System.out.printf() uses format specifiers: %d for int, %s for string, %n for newline",
          "The class name MUST match the filename: J01_HelloWorld",
        ],
        testCases: [
          { input: "", expected: "Hello, World!\nJava version: 25" },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 01 — Hello World & Output
// ════════════════════════════════════════════════════
// LEARN: Every Java program needs a class and a main()
//        System.out.println() prints with a newline
//        System.out.printf() lets you format output
// ════════════════════════════════════════════════════

public class J01_HelloWorld {
    public static void main(String[] args) {
        // Basic print
        System.out.println("Hello, World!");

        // Formatted print — %d = integer, %n = newline
        int version = 25;
        System.out.printf("Java version: %d%n", version);
    }
}
`,
      },

      {
        id: "java-02",
        label: "02 · Variables & Data Types",
        filename: "J02_Variables.java",
        language: "Java",
        questionText:
`Java is strongly typed — every variable must have a declared type.

Primitive types you must know:
  int     → whole numbers (-2,147,483,648 to 2,147,483,647)
  double  → decimal numbers (64-bit floating point)
  boolean → true or false
  char    → single character in single quotes: 'A'
  String  → text in double quotes (not a primitive — it's an object)

Run the code and verify the output matches the expected output exactly.
Then try: change gpa to 7.5 and see how %.2f formats it.`,
        hints: [
          "String is an object, not a primitive — it uses double quotes",
          "char uses single quotes: char c = 'A'",
          "%.2f in printf means 2 decimal places",
          "boolean values print as lowercase: true / false",
        ],
        testCases: [
          {
            input: "",
            expected: "Name: Alice\nAge: 20\nGPA: 9.20\nPassing: true\nFirst initial: A",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 02 — Variables & Data Types
// ════════════════════════════════════════════════════

public class J02_Variables {
    public static void main(String[] args) {
        String  name    = "Alice";
        int     age     = 20;
        double  gpa     = 9.2;
        boolean pass    = true;
        char    initial = 'A';

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.printf("GPA: %.2f%n", gpa);
        System.out.println("Passing: " + pass);
        System.out.println("First initial: " + initial);
    }
}
`,
      },

      {
        id: "java-03",
        label: "03 · Control Flow",
        filename: "J03_ControlFlow.java",
        language: "Java",
        questionText:
`Read an integer from stdin, then print three lines:
  Line 1: "Grade: X" where X is A/B/C/D/F based on marks
           A ≥ 90 | B ≥ 75 | C ≥ 60 | D ≥ 45 | F otherwise
  Line 2: "N is even" or "N is odd"
  Line 3: "Countdown: 5 4 3 2 1 " (with trailing space)

Use Scanner to read from stdin.
Use if-else chain for grading.
Use % (modulo) for even/odd check.
Use a for loop for countdown.`,
        hints: [
          "Scanner sc = new Scanner(System.in); int marks = sc.nextInt();",
          "Modulo: marks % 2 == 0 means even",
          "For countdown: for (int i = 5; i >= 1; i--) System.out.print(i + \" \");",
          "Ternary operator: condition ? valueIfTrue : valueIfFalse",
        ],
        testCases: [
          { input: "85",  expected: "Grade: B\n85 is odd\nCountdown: 5 4 3 2 1 " },
          { input: "95",  expected: "Grade: A\n95 is odd\nCountdown: 5 4 3 2 1 " },
          { input: "40",  expected: "Grade: F\n40 is even\nCountdown: 5 4 3 2 1 " },
          { input: "60",  expected: "Grade: C\n60 is even\nCountdown: 5 4 3 2 1 " },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 03 — Control Flow (if/else, loops)
// ════════════════════════════════════════════════════

import java.util.Scanner;

public class J03_ControlFlow {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int marks = sc.nextInt();

        // if-else chain for grade
        String grade;
        if      (marks >= 90) grade = "A";
        else if (marks >= 75) grade = "B";
        else if (marks >= 60) grade = "C";
        else if (marks >= 45) grade = "D";
        else                  grade = "F";

        System.out.println("Grade: " + grade);

        // Even / odd via modulo
        System.out.println(marks + " is " + (marks % 2 == 0 ? "even" : "odd"));

        // For loop countdown
        System.out.print("Countdown: ");
        for (int i = 5; i >= 1; i--) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
}
`,
      },

      {
        id: "java-04",
        label: "04 · Arrays & Methods",
        filename: "J04_Arrays.java",
        language: "Java",
        questionText:
`Work with arrays and write static helper methods.

Given int[] marks = {45, 82, 23, 12, 78}:
  1. Write static method max(int[] a) → returns the largest element
  2. Write static method min(int[] a) → returns the smallest element
  3. Write static method average(int[] a) → returns double average
  4. Use Arrays.sort(marks) to sort in-place
  5. Print sorted array, then print it in reverse

Expected output format:
  Max: 82
  Min: 12
  Average: 51.40
  Sorted: 12 23 45 78 82 (with trailing space)
  Reversed: 82 78 45 23 12 (with trailing space)`,
        hints: [
          "For max: start with m = a[0], loop through and update if x > m",
          "Cast to double before dividing: (double) sum / a.length",
          "Arrays.sort() sorts ascending in-place — import java.util.Arrays",
          "For reversed: loop from marks.length-1 down to 0",
        ],
        testCases: [
          {
            input: "",
            expected: "Max: 82\nMin: 12\nAverage: 51.40\nSorted: 12 23 45 78 82 \nReversed: 82 78 45 23 12 ",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 04 — Arrays & Static Methods
// ════════════════════════════════════════════════════

import java.util.Arrays;

public class J04_Arrays {

    static int max(int[] a) {
        int m = a[0];
        for (int x : a) if (x > m) m = x;
        return m;
    }

    static int min(int[] a) {
        int m = a[0];
        for (int x : a) if (x < m) m = x;
        return m;
    }

    static double average(int[] a) {
        int sum = 0;
        for (int x : a) sum += x;
        return (double) sum / a.length;
    }

    public static void main(String[] args) {
        int[] marks = {45, 82, 23, 12, 78};

        System.out.println("Max: " + max(marks));
        System.out.println("Min: " + min(marks));
        System.out.printf("Average: %.2f%n", average(marks));

        Arrays.sort(marks);
        System.out.print("Sorted: ");
        for (int m : marks) System.out.print(m + " ");
        System.out.println();

        System.out.print("Reversed: ");
        for (int i = marks.length - 1; i >= 0; i--)
            System.out.print(marks[i] + " ");
        System.out.println();
    }
}
`,
      },

      {
        id: "java-05",
        label: "05 · OOP — Classes & Objects",
        filename: "J05_OOP.java",
        language: "Java",
        questionText:
`Create a Student class with proper OOP principles.

The Student class must have:
  - Private fields: name (String), roll (String), gpa (double)
  - A constructor: Student(name, roll, gpa)
  - Getters: getName(), getGpa()
  - Method: isPassing() → returns true if gpa >= 5.0
  - Override toString() to return: Student[name=X, roll=Y, gpa=Z.ZZ]

In main():
  1. Create Alice (CS101, gpa=9.2) and Bob (CS102, gpa=7.5)
  2. Print both using println (calls toString automatically)
  3. Print "[name] is passing/failing" for each
  4. Find and print the top student by gpa`,
        hints: [
          "private fields prevent direct access from outside the class",
          "@Override on toString() tells Java you're replacing the default",
          "String.format(\"%.2f\", gpa) formats to 2 decimal places",
          "Ternary for passing: s.isPassing() ? \"passing\" : \"failing\"",
        ],
        testCases: [
          {
            input: "",
            expected: "Student[name=Alice, roll=CS101, gpa=9.20]\nStudent[name=Bob, roll=CS102, gpa=7.50]\nAlice is passing\nBob is passing\nTop student: Alice (9.20)",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 05 — OOP: Classes & Objects
// ════════════════════════════════════════════════════

public class J05_OOP {

    static class Student {
        private String name;
        private String roll;
        private double gpa;

        public Student(String name, String roll, double gpa) {
            this.name = name;
            this.roll = roll;
            this.gpa  = gpa;
        }

        public double getGpa()  { return gpa; }
        public String getName() { return name; }
        public boolean isPassing() { return gpa >= 5.0; }

        @Override
        public String toString() {
            return String.format("Student[name=%s, roll=%s, gpa=%.2f]",
                name, roll, gpa);
        }
    }

    public static void main(String[] args) {
        Student s1 = new Student("Alice", "CS101", 9.2);
        Student s2 = new Student("Bob",   "CS102", 7.5);

        System.out.println(s1);
        System.out.println(s2);

        for (Student s : new Student[]{s1, s2}) {
            System.out.println(s.getName() + " is " +
                (s.isPassing() ? "passing" : "failing"));
        }

        Student top = s1.getGpa() >= s2.getGpa() ? s1 : s2;
        System.out.printf("Top student: %s (%.2f)%n",
            top.getName(), top.getGpa());
    }
}
`,
      },

      {
        id: "java-06",
        label: "06 · Inheritance & Polymorphism",
        filename: "J06_Inheritance.java",
        language: "Java",
        questionText:
`Build a shape hierarchy using abstract classes.

Create an abstract class Shape with:
  - abstract double area()
  - abstract double perimeter()
  - void describe(String label) that prints: "Label     area = X.XX  perimeter = Y.YY"

Create three subclasses:
  - Circle(double r): area = π*r², perimeter = 2*π*r
  - Rectangle(double w, double h): area = w*h, perimeter = 2*(w+h)
  - Triangle(double a, double b, double c): use Heron's formula for area

Then find and print the shape with the largest area.`,
        hints: [
          "abstract class cannot be instantiated directly",
          "Math.PI for π, Math.sqrt() for square root",
          "Heron's formula: s=(a+b+c)/2, area=√(s(s-a)(s-b)(s-c))",
          "%-10s in printf pads the string to 10 chars (left-aligned)",
        ],
        testCases: [
          {
            input: "",
            expected: "Circle    area = 78.54  perimeter = 31.42\nRectangle area = 24.00  perimeter = 20.00\nTriangle  area = 6.00   perimeter = 12.00\nLargest shape: Circle (78.54)",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 06 — Inheritance & Polymorphism
// ════════════════════════════════════════════════════

public class J06_Inheritance {

    abstract static class Shape {
        abstract double area();
        abstract double perimeter();

        void describe(String label) {
            System.out.printf("%-10s area = %-7.2f perimeter = %.2f%n",
                label, area(), perimeter());
        }
    }

    static class Circle extends Shape {
        double r;
        Circle(double r) { this.r = r; }
        @Override public double area()      { return Math.PI * r * r; }
        @Override public double perimeter() { return 2 * Math.PI * r; }
    }

    static class Rectangle extends Shape {
        double w, h;
        Rectangle(double w, double h) { this.w = w; this.h = h; }
        @Override public double area()      { return w * h; }
        @Override public double perimeter() { return 2 * (w + h); }
    }

    static class Triangle extends Shape {
        double a, b, c;
        Triangle(double a, double b, double c) { this.a=a; this.b=b; this.c=c; }
        @Override public double area() {
            double s = (a + b + c) / 2;
            return Math.sqrt(s * (s-a) * (s-b) * (s-c));
        }
        @Override public double perimeter() { return a + b + c; }
    }

    public static void main(String[] args) {
        Shape[]  shapes = { new Circle(5), new Rectangle(4, 6), new Triangle(3, 4, 5) };
        String[] labels = { "Circle", "Rectangle", "Triangle" };

        for (int i = 0; i < shapes.length; i++)
            shapes[i].describe(labels[i]);

        Shape largest = shapes[0]; String largestLabel = labels[0];
        for (int i = 1; i < shapes.length; i++) {
            if (shapes[i].area() > largest.area()) {
                largest = shapes[i]; largestLabel = labels[i];
            }
        }
        System.out.printf("Largest shape: %s (%.2f)%n", largestLabel, largest.area());
    }
}
`,
      },

      {
        id: "java-07",
        label: "07 · Interfaces",
        filename: "J07_Interfaces.java",
        language: "Java",
        questionText:
`Understand interfaces — a pure contract that classes must fulfil.

Create two interfaces:
  - Saveable: void save(double amount), double load()
  - Encryptable: default boolean supportsEncryption() → returns false

Create two storage classes:
  - BankStorage implements Saveable AND Encryptable
    • Overrides supportsEncryption() to return true
    • save() prints "Saving X.XX to Bank"
    • load() prints "Loading from Bank: X.XX"
  - CloudStorage implements Saveable AND Encryptable
    • Does NOT override supportsEncryption() (uses default = false)

Key difference from inheritance: a class can implement MULTIPLE interfaces.`,
        hints: [
          "interface keyword, not class — no constructor, no state",
          "default methods in interfaces have a body (unlike abstract methods)",
          "implements keyword, comma-separated for multiple: implements A, B",
          "Cast to Encryptable to call supportsEncryption(): ((Encryptable) s)",
        ],
        testCases: [
          {
            input: "",
            expected: "Saving 1000.00 to Bank\nSaving 1000.00 to Cloud\nLoading from Bank: 1000.00\nLoading from Cloud: 1000.00\nBank supports encryption: true\nCloud supports encryption: false",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 07 — Interfaces
// ════════════════════════════════════════════════════

public class J07_Interfaces {

    interface Saveable {
        void save(double amount);
        double load();
    }

    interface Encryptable {
        default boolean supportsEncryption() { return false; }
    }

    static class BankStorage implements Saveable, Encryptable {
        private double stored = 0;
        @Override public void   save(double a) { stored = a; System.out.printf("Saving %.2f to Bank%n", a); }
        @Override public double load()         { System.out.printf("Loading from Bank: %.2f%n", stored); return stored; }
        @Override public boolean supportsEncryption() { return true; }
    }

    static class CloudStorage implements Saveable, Encryptable {
        private double stored = 0;
        @Override public void   save(double a) { stored = a; System.out.printf("Saving %.2f to Cloud%n", a); }
        @Override public double load()         { System.out.printf("Loading from Cloud: %.2f%n", stored); return stored; }
    }

    public static void main(String[] args) {
        Saveable[] storages = { new BankStorage(), new CloudStorage() };
        String[]   names    = { "Bank", "Cloud" };

        for (Saveable s : storages) s.save(1000.00);
        for (Saveable s : storages) s.load();

        for (int i = 0; i < storages.length; i++) {
            Encryptable e = (Encryptable) storages[i];
            System.out.println(names[i] + " supports encryption: " + e.supportsEncryption());
        }
    }
}
`,
      },

      {
        id: "java-08",
        label: "08 · Collections (List, Map, Set)",
        filename: "J08_Collections.java",
        language: "Java",
        questionText:
`Java Collections Framework — the three core data structures:

ArrayList<T>  → ordered, resizable, allows duplicates → use for sequences
HashMap<K,V>  → key → value mapping, O(1) lookup → use for frequency/lookup
HashSet<T>    → unique elements only, O(1) add/contains → use for sets

Tasks:
  1. Build a roster List and add "Dave" to it
  2. Count word frequencies in a String[] using HashMap
  3. Find the intersection of two HashSets using retainAll()

Note: HashMap.toString() order is not guaranteed — the test case
expects sorted output for the intersection only.`,
        hints: [
          "new ArrayList<>(Arrays.asList(...)) to initialize from values",
          "freq.getOrDefault(w, 0) + 1 — safe get with default",
          "retainAll() modifies the set in-place to keep only common elements",
          "Collections.sort(list) to sort a List before printing",
        ],
        testCases: [
          {
            input: "",
            expected: "Roster: [Alice, Bob, Carol, Dave]\nSize: 4\nWord counts: {hello=2, world=1, java=1}\nUnique words: 3\nCommon: [Bob, Carol]",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 08 — Collections: ArrayList, HashMap, HashSet
// ════════════════════════════════════════════════════

import java.util.*;

public class J08_Collections {
    public static void main(String[] args) {

        // ArrayList
        List<String> roster = new ArrayList<>(Arrays.asList("Alice", "Bob", "Carol"));
        roster.add("Dave");
        System.out.println("Roster: " + roster);
        System.out.println("Size: " + roster.size());

        // HashMap — word frequency counter
        String[] words = {"hello", "world", "hello", "java"};
        Map<String, Integer> freq = new HashMap<>();
        for (String w : words) {
            freq.put(w, freq.getOrDefault(w, 0) + 1);
        }
        System.out.println("Word counts: " + freq);
        System.out.println("Unique words: " + freq.size());

        // HashSet — intersection
        Set<String> groupA = new HashSet<>(Arrays.asList("Alice", "Bob", "Carol"));
        Set<String> groupB = new HashSet<>(Arrays.asList("Bob", "Carol", "Eve"));
        groupA.retainAll(groupB);
        List<String> common = new ArrayList<>(groupA);
        Collections.sort(common);
        System.out.println("Common: " + common);
    }
}
`,
      },

      {
        id: "java-09",
        label: "09 · Exception Handling",
        filename: "J09_Exceptions.java",
        language: "Java",
        questionText:
`Handle errors gracefully using Java's try-catch-finally.

Read two values from stdin (may not be valid integers).

Tasks:
  1. Create a custom DivisionByZeroException (extends Exception)
  2. Write safeDivide(a, b) that throws it when b == 0
  3. In main, catch: DivisionByZeroException and NumberFormatException separately
  4. A finally block always runs — use it for cleanup/file-close simulation
  5. After the try-catch, call readFile() which always prints "File read: OK"

Test cases:
  "10 2"  → prints "10 / 2 = 5" then "File read: OK"
  "10 0"  → prints "Error: Cannot divide by zero!" then "File read: OK"
  "abc 2" → prints "Error: Invalid number format" then "File read: OK"`,
        hints: [
          "class DivisionByZeroException extends Exception { public DivisionByZeroException(String msg) { super(msg); } }",
          "throw new DivisionByZeroException(\"message\") to trigger it",
          "catch blocks are checked top-to-bottom — specific before general",
          "finally runs even if an exception is thrown",
        ],
        testCases: [
          { input: "10\n2",   expected: "10 / 2 = 5\nFile read: OK" },
          { input: "10\n0",   expected: "Error: Cannot divide by zero!\nFile read: OK" },
          { input: "abc\n2",  expected: "Error: Invalid number format\nFile read: OK" },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 09 — Exception Handling
// ════════════════════════════════════════════════════

import java.util.Scanner;

public class J09_Exceptions {

    static class DivisionByZeroException extends Exception {
        public DivisionByZeroException(String msg) { super(msg); }
    }

    static int safeDivide(int a, int b) throws DivisionByZeroException {
        if (b == 0) throw new DivisionByZeroException("Cannot divide by zero!");
        return a / b;
    }

    static void readFile(String path) throws java.io.IOException {
        System.out.println("File read: OK");
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        try {
            int a = Integer.parseInt(sc.next());
            int b = Integer.parseInt(sc.next());
            int result = safeDivide(a, b);
            System.out.println(a + " / " + b + " = " + result);
        } catch (DivisionByZeroException e) {
            System.out.println("Error: " + e.getMessage());
        } catch (NumberFormatException e) {
            System.out.println("Error: Invalid number format");
        }

        try {
            readFile("data.txt");
        } catch (java.io.IOException e) {
            System.out.println("IO Error: " + e.getMessage());
        } finally {
            // cleanup would go here
        }
    }
}
`,
      },

      {
        id: "java-10",
        label: "10 · Generics & Functional",
        filename: "J10_Generics.java",
        language: "Java",
        questionText:
`Generics let you write type-safe code that works with any type.
Lambdas and Streams make collection processing clean and concise.

Tasks:
  1. Implement a generic Stack<T> class with push(), pop(), isEmpty()
  2. Write a generic filter() method using Predicate<T>
  3. Write a generic transform() method using Function<T,R>
  4. Use Stream API to sum a list of numbers

Expected output:
  Stack push: 10 20 30
  Pop: 30
  Pop: 20
  Numbers > 15: [20, 30]
  Squares: [100, 400, 900]
  Sum: 60`,
        hints: [
          "<T> in class definition makes it generic — T is a type placeholder",
          "Predicate<T>: functional interface with method test(T t) → boolean",
          "Lambda syntax: n -> n > 15 is a Predicate<Integer>",
          "stream().filter().map().collect(Collectors.toList()) is the pipeline",
        ],
        testCases: [
          {
            input: "",
            expected: "Stack push: 10 20 30\nPop: 30\nPop: 20\nNumbers > 15: [20, 30]\nSquares: [100, 400, 900]\nSum: 60",
          },
        ],
        code:
`// ════════════════════════════════════════════════════
// STEP 10 — Generics & Functional Programming
// ════════════════════════════════════════════════════

import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class J10_Generics {

    static class Stack<T> {
        private final List<T> data = new ArrayList<>();
        public void push(T item) { data.add(item); }
        public T pop() {
            if (data.isEmpty()) throw new NoSuchElementException("Stack is empty");
            return data.remove(data.size() - 1);
        }
        public boolean isEmpty() { return data.isEmpty(); }
    }

    static <T> List<T> filter(List<T> list, Predicate<T> pred) {
        return list.stream().filter(pred).collect(Collectors.toList());
    }

    static <T, R> List<R> transform(List<T> list, Function<T, R> fn) {
        return list.stream().map(fn).collect(Collectors.toList());
    }

    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        System.out.print("Stack push: ");
        for (int v : new int[]{10, 20, 30}) { stack.push(v); System.out.print(v + " "); }
        System.out.println();
        System.out.println("Pop: " + stack.pop());
        System.out.println("Pop: " + stack.pop());

        List<Integer> nums = Arrays.asList(10, 20, 30);
        System.out.println("Numbers > 15: " + filter(nums, n -> n > 15));
        System.out.println("Squares: "      + transform(nums, n -> n * n));
        System.out.println("Sum: "          + nums.stream().reduce(0, Integer::sum));
    }
}
`,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // DBMS
  // ══════════════════════════════════════════════════════════════════
  {
    name: "DBMS",
    questions: [
      {
        id: "dbms-1",
        label: "SQL Basics — SELECT & JOIN",
        filename: "dbms_basics.sql",
        language: "SQL",
        questionText:
`Practice fundamental SQL queries on a student database.

Schema:
  students(id, name, dept, cgpa)
  courses(id, name, credits)
  enrollments(student_id, course_id, grade)

Write queries to:
  Q1. Select all students in the 'CS' department
  Q2. Get names of students with cgpa > 8.0, ordered by cgpa DESC
  Q3. JOIN students and enrollments to get student name + grade
  Q4. COUNT total enrollments per department using GROUP BY
  Q5. UPDATE grade to 'A' for students with cgpa >= 9.0

Note: SQL files run as reference/study material — no live execution yet.`,
        hints: [
          "SELECT col1, col2 FROM table WHERE condition ORDER BY col DESC",
          "JOIN: SELECT s.name FROM students s JOIN enrollments e ON s.id = e.student_id",
          "GROUP BY: SELECT dept, COUNT(*) FROM students GROUP BY dept",
          "Subquery in WHERE: WHERE student_id IN (SELECT id FROM students WHERE cgpa >= 9.0)",
        ],
        testCases: [],
        code:
`-- DBMS — SQL Basics: SELECT, JOIN, GROUP BY
-- ──────────────────────────────────────────

-- Schema (for reference):
-- students(id, name, dept, cgpa)
-- courses(id, name, credits)
-- enrollments(student_id, course_id, grade)

-- Q1: All CS department students
SELECT * FROM students
WHERE dept = 'CS';

-- Q2: High CGPA students sorted descending
SELECT name, cgpa
FROM students
WHERE cgpa > 8.0
ORDER BY cgpa DESC;

-- Q3: JOIN — student names with their grades
SELECT s.name, e.grade
FROM students s
JOIN enrollments e ON s.id = e.student_id;

-- Q4: Enrollment count per department
SELECT s.dept, COUNT(*) AS total_enrollments
FROM students s
JOIN enrollments e ON s.id = e.student_id
GROUP BY s.dept
ORDER BY total_enrollments DESC;

-- Q5: UPDATE with subquery — set grade 'A' for high CGPA students
UPDATE enrollments
SET grade = 'A'
WHERE student_id IN (
    SELECT id FROM students WHERE cgpa >= 9.0
);
`,
      },
    ],
  },
];

// ── Flat lookup: questionId → full snippet data ───────────────────────────────
export const SNIPPETS = {};
for (const subject of SUBJECTS) {
  for (const q of subject.questions) {
    SNIPPETS[q.id] = {
      filename:     q.filename,
      language:     q.language,
      code:         q.code,
      label:        q.label,
      questionText: q.questionText || "",
      hints:        q.hints        || [],
      testCases:    q.testCases    || [],
    };
  }
}

// Default question ID shown on IDE open
export const DEFAULT_ID = "py-1";
