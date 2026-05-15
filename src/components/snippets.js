/* snippets.js
   Organized by subject → questions.
   Each question has: { id, label, filename, language, code }
   The `id` is globally unique across all subjects.
*/

export const SUBJECTS = [
  {
    name: "Python",
    questions: [
      {
        id: "py-1",
        label: "Basics & Data Types",
        filename: "python_basics.py",
        language: "Python",
        code: `# Python Basics — Data Types & Control Flow
# ─────────────────────────────────────────

# Q1: Working with lists, tuples, and dicts
students = [
    {"name": "Alice", "grade": 92},
    {"name": "Bob",   "grade": 85},
    {"name": "Carol", "grade": 78},
]

# Q2: List comprehension — filter passing students
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
        code: `# Python OOP — Classes & Inheritance
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
        label: "Statistics & Math",
        filename: "stats_midterm.py",
        language: "Python · Statistics",
        code: `# Stats Midterm — Hypothesis Testing
# ────────────────────────────────────

import math

def z_score(x, mu, sigma):
    """Standardise a value to Z-score."""
    return (x - mu) / sigma

def confidence_interval(x_bar, sigma, n, z=1.96):
    """95% CI for a population mean (known sigma)."""
    margin = z * (sigma / math.sqrt(n))
    return (x_bar - margin, x_bar + margin)

def p_value_one_tail(z):
    """Approximate one-tailed p-value via error function."""
    return 0.5 * (1 - math.erf(z / math.sqrt(2)))

# Sample problem
mu, sigma, n = 50, 10, 36
x_bar = 53.5

z = z_score(x_bar, mu, sigma / math.sqrt(n))
ci = confidence_interval(x_bar, sigma, n)
p  = p_value_one_tail(z)

print(f"Z-score : {z:.4f}")
print(f"95% CI  : ({ci[0]:.2f}, {ci[1]:.2f})")
print(f"p-value : {p:.4f}  →  {'Reject H₀' if p < 0.05 else 'Fail to reject H₀'}")
`,
      },
    ],
  },
  {
    name: "PDSA",
    questions: [
      {
        id: "pdsa-1",
        label: "BFS & Shortest Path",
        filename: "pdsa_quiz3.py",
        language: "Python · Graphs",
        code: `# PDSA Quiz 3 — BFS & Shortest Path
# ────────────────────────────────────

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

# Adjacency list
graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}

print(bfs(graph, "A"))   # ['A', 'B', 'C', 'D', 'E', 'F']
`,
      },
      {
        id: "pdsa-2",
        label: "DP — LCS & Knapsack",
        filename: "pdsa_endsem.py",
        language: "Python · DP / Trees",
        code: `# PDSA End-Sem — Dynamic Programming (LCS + Knapsack)
# ──────────────────────────────────────────────────────

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

print(lcs("ABCBDAB", "BDCAB"))           # 4
print(knapsack([2,3,4,5], [3,4,5,6], 8)) # 10
`,
      },
      {
        id: "pdsa-3",
        label: "Sorting Algorithms",
        filename: "pdsa_sorting.py",
        language: "Python · Sorting",
        code: `# PDSA — Sorting Algorithms Comparison
# ──────────────────────────────────────

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
    """Quick Sort — O(n log n) average, in-place variant."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left  = [x for x in arr if x < pivot]
    mid   = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

# Test
data = [38, 27, 43, 3, 9, 82, 10]
print("Merge Sort:", merge_sort(data))
print("Quick Sort:", quick_sort(data))
`,
      },
    ],
  },
  {
    name: "MAD 1",
    questions: [
      {
        id: "mad1-1",
        label: "Flask Routing & Templates",
        filename: "week4_exam.py",
        language: "Python · Flask",
        code: `# MAD1 Week 4 Exam — Flask Routing & Templates
# ─────────────────────────────────────────────

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Q1: Define a route that accepts GET and POST
@app.route("/submit", methods=["GET", "POST"])
def submit():
    if request.method == "POST":
        name = request.form.get("name", "")
        return redirect(url_for("greet", name=name))
    return render_template("submit.html")

# Q2: Dynamic URL segments
@app.route("/greet/<name>")
def greet(name):
    return render_template("greet.html", username=name)

if __name__ == "__main__":
    app.run(debug=True)
`,
      },
      {
        id: "mad1-2",
        label: "Flask + SQLAlchemy CRUD",
        filename: "mad1_endsem.py",
        language: "Python · Flask + SQLAlchemy",
        code: `# MAD1 End-Sem — Flask + SQLAlchemy CRUD
# ────────────────────────────────────────

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///students.db"
db = SQLAlchemy(app)

class Student(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    name    = db.Column(db.String(80), nullable=False)
    roll_no = db.Column(db.String(20), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "roll": self.roll_no}

@app.route("/students", methods=["GET"])
def get_students():
    return jsonify([s.to_dict() for s in Student.query.all()])

@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    s = Student(name=data["name"], roll_no=data["roll_no"])
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
`,
      },
      {
        id: "mad1-3",
        label: "Jinja2 Templates",
        filename: "mad1_jinja.py",
        language: "Python · Jinja2",
        code: `# MAD1 — Jinja2 Templating Basics
# ─────────────────────────────────

from flask import Flask, render_template_string

app = Flask(__name__)

# Q1: Template with loops and conditionals
TEMPLATE = """
<!DOCTYPE html>
<html>
<body>
  <h1>Student Report</h1>
  <table>
    <tr><th>Name</th><th>Grade</th><th>Status</th></tr>
    {% for s in students %}
    <tr>
      <td>{{ s.name }}</td>
      <td>{{ s.grade }}</td>
      <td>{{ "Pass" if s.grade >= 40 else "Fail" }}</td>
    </tr>
    {% endfor %}
  </table>
  <p>Total: {{ students | length }} students</p>
</body>
</html>
"""

@app.route("/report")
def report():
    students = [
        {"name": "Alice", "grade": 92},
        {"name": "Bob",   "grade": 35},
        {"name": "Carol", "grade": 78},
    ]
    return render_template_string(TEMPLATE, students=students)

if __name__ == "__main__":
    app.run(debug=True)
`,
      },
    ],
  },
  {
    name: "MAD 2",
    questions: [
      {
        id: "mad2-1",
        label: "Vue.js Components",
        filename: "mad2_vue.js",
        language: "JavaScript · Vue",
        code: `// MAD2 — Vue.js Component Basics
// ────────────────────────────────

const app = Vue.createApp({
  data() {
    return {
      tasks: [
        { id: 1, text: "Complete Week 4 Quiz", done: false },
        { id: 2, text: "Submit Lab Assignment", done: true },
        { id: 3, text: "Review Lecture Notes",  done: false },
      ],
      newTask: "",
    };
  },

  computed: {
    // Q1: Computed property for pending count
    pendingCount() {
      return this.tasks.filter(t => !t.done).length;
    },
  },

  methods: {
    // Q2: Add a new task
    addTask() {
      if (!this.newTask.trim()) return;
      this.tasks.push({
        id: Date.now(),
        text: this.newTask.trim(),
        done: false,
      });
      this.newTask = "";
    },

    // Q3: Toggle task completion
    toggleTask(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) task.done = !task.done;
    },

    // Q4: Remove completed tasks
    clearDone() {
      this.tasks = this.tasks.filter(t => !t.done);
    },
  },
});

app.mount("#app");
`,
      },
      {
        id: "mad2-2",
        label: "REST API with Flask",
        filename: "mad2_api.py",
        language: "Python · REST API",
        code: `# MAD2 — RESTful API Design
# ──────────────────────────

from flask import Flask, request, jsonify
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

# In-memory store
tasks = {}
next_id = 1

class TaskList(Resource):
    """GET all tasks, POST a new task."""

    def get(self):
        return jsonify(list(tasks.values()))

    def post(self):
        global next_id
        data = request.get_json()
        task = {
            "id": next_id,
            "title": data["title"],
            "status": "pending",
        }
        tasks[next_id] = task
        next_id += 1
        return task, 201

class TaskItem(Resource):
    """GET, PUT, DELETE a single task."""

    def get(self, task_id):
        if task_id not in tasks:
            return {"error": "Not found"}, 404
        return tasks[task_id]

    def put(self, task_id):
        if task_id not in tasks:
            return {"error": "Not found"}, 404
        data = request.get_json()
        tasks[task_id].update(data)
        return tasks[task_id]

    def delete(self, task_id):
        if task_id not in tasks:
            return {"error": "Not found"}, 404
        del tasks[task_id]
        return "", 204

api.add_resource(TaskList, "/api/tasks")
api.add_resource(TaskItem, "/api/tasks/<int:task_id>")

if __name__ == "__main__":
    app.run(debug=True)
`,
      },
    ],
  },
  {
    name: "Java",
    questions: [
      {
        id: "java-1",
        label: "OOP Fundamentals",
        filename: "JavaOOP.java",
        language: "Java",
        code: `// Java OOP — Classes, Inheritance & Interfaces
// ──────────────────────────────────────────────

interface Printable {
    void print();
}

abstract class Vehicle implements Printable {
    protected String make;
    protected int year;

    public Vehicle(String make, int year) {
        this.make = make;
        this.year = year;
    }

    abstract double fuelEfficiency();

    @Override
    public void print() {
        System.out.printf("%s (%d) — %.1f km/l%n",
            make, year, fuelEfficiency());
    }
}

class Car extends Vehicle {
    private double engineSize;

    public Car(String make, int year, double engineSize) {
        super(make, year);
        this.engineSize = engineSize;
    }

    @Override
    double fuelEfficiency() {
        return 20.0 / engineSize * 10;
    }
}

class ElectricCar extends Vehicle {
    private double batteryKWh;

    public ElectricCar(String make, int year, double batteryKWh) {
        super(make, year);
        this.batteryKWh = batteryKWh;
    }

    @Override
    double fuelEfficiency() {
        return batteryKWh * 5.5;
    }
}

public class JavaOOP {
    public static void main(String[] args) {
        Vehicle[] fleet = {
            new Car("Honda Civic", 2023, 1.5),
            new ElectricCar("Tesla Model 3", 2024, 75),
            new Car("Toyota Camry", 2022, 2.5),
        };

        for (Vehicle v : fleet) {
            v.print();
        }
    }
}
`,
      },
      {
        id: "java-2",
        label: "Collections & Streams",
        filename: "JavaStreams.java",
        language: "Java · Streams",
        code: `// Java Collections & Streams API
// ────────────────────────────────

import java.util.*;
import java.util.stream.*;

public class JavaStreams {

    record Student(String name, int grade, String dept) {}

    public static void main(String[] args) {
        List<Student> students = List.of(
            new Student("Alice",  92, "CS"),
            new Student("Bob",    67, "CS"),
            new Student("Carol",  85, "Math"),
            new Student("Dave",   45, "CS"),
            new Student("Eve",    91, "Math")
        );

        // Q1: Filter & map — names of passing CS students
        List<String> passingCS = students.stream()
            .filter(s -> s.dept().equals("CS"))
            .filter(s -> s.grade() >= 60)
            .map(Student::name)
            .collect(Collectors.toList());

        System.out.println("Passing CS: " + passingCS);

        // Q2: Average grade per department
        Map<String, Double> avgByDept = students.stream()
            .collect(Collectors.groupingBy(
                Student::dept,
                Collectors.averagingInt(Student::grade)
            ));

        System.out.println("Avg by dept: " + avgByDept);

        // Q3: Top scorer
        students.stream()
            .max(Comparator.comparingInt(Student::grade))
            .ifPresent(s ->
                System.out.println("Top: " + s.name() + " (" + s.grade() + ")")
            );
    }
}
`,
      },
      {
        id: "java-3",
        label: "Multithreading",
        filename: "JavaThreads.java",
        language: "Java · Threads",
        code: `// Java Multithreading — Threads & Synchronization
// ─────────────────────────────────────────────────

class BankAccount {
    private double balance;

    public BankAccount(double initial) {
        this.balance = initial;
    }

    // Q1: Synchronized method to prevent race conditions
    public synchronized void deposit(double amount) {
        balance += amount;
        System.out.printf("  Deposited %.2f → Balance: %.2f%n",
            amount, balance);
    }

    public synchronized void withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
            System.out.printf("  Withdrew  %.2f → Balance: %.2f%n",
                amount, balance);
        } else {
            System.out.println("  Insufficient funds!");
        }
    }

    public double getBalance() { return balance; }
}

public class JavaThreads {
    public static void main(String[] args) throws InterruptedException {
        BankAccount account = new BankAccount(1000);

        // Q2: Create threads for concurrent operations
        Thread depositor = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                account.deposit(100);
                try { Thread.sleep(50); }
                catch (InterruptedException e) { break; }
            }
        }, "Depositor");

        Thread withdrawer = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                account.withdraw(150);
                try { Thread.sleep(50); }
                catch (InterruptedException e) { break; }
            }
        }, "Withdrawer");

        depositor.start();
        withdrawer.start();

        // Q3: Wait for both threads to finish
        depositor.join();
        withdrawer.join();

        System.out.printf("Final balance: %.2f%n",
            account.getBalance());
    }
}
`,
      },
    ],
  },
];

// Flat lookup: questionId → snippet data (used by CodeBlock)
export const SNIPPETS = {};
for (const subject of SUBJECTS) {
  for (const q of subject.questions) {
    SNIPPETS[q.id] = {
      filename: q.filename,
      language: q.language,
      code: q.code,
    };
  }
}

// Default question ID
export const DEFAULT_ID = "py-1";
