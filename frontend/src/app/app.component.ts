import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AuthMode = 'login' | 'signup';
type NoticeType = 'success' | 'error';
type WorkoutStatus = 'pending' | 'completed' | 'skipped';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface Exercise {
  _id: string;
  name: string;
  description: string;
  category: string;
  muscleGroup: string;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  repetitions: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

interface Workout {
  _id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  scheduledDate: string;
  status: WorkoutStatus;
  completedDate?: string;
}

interface WorkoutLine {
  exercise: string;
  sets: number;
  repetitions: number;
  weight: number;
}

interface ProgressReport {
  summary: {
    totalWorkouts: number;
    totalExercises: number;
    averageExercisesPerWorkout: string | number;
    currentStreak: number;
    longestStreak: number;
  };
  topExercises: Array<{ name: string; count: number }>;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5001/api';
  private readonly storageKey = 'workout-tracker-session';

  authMode: AuthMode = 'login';
  authForm = {
    name: '',
    email: '',
    password: '',
  };

  workoutForm = this.newWorkoutForm();
  statusFilter = '';
  user: AuthUser | null = null;
  exercises: Exercise[] = [];
  workouts: Workout[] = [];
  report: ProgressReport | null = null;
  notice = '';
  noticeType: NoticeType = 'success';
  loading = false;

  get statCards(): Array<{ label: string; value: string | number; caption: string }> {
    const workouts = this.workouts;
    const report = this.report;
    const completed = workouts.filter((workout) => workout.status === 'completed').length;
    const pending = workouts.filter((workout) => workout.status === 'pending').length;

    return [
      { label: 'Total', value: workouts.length, caption: 'Scheduled workouts' },
      { label: 'Completed', value: completed, caption: 'Logged sessions' },
      { label: 'Pending', value: pending, caption: 'Still on deck' },
      {
        label: 'Avg exercises',
        value: report?.summary?.averageExercisesPerWorkout || 0,
        caption: 'Per completed workout',
      },
    ];
  }

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    const savedSession = localStorage.getItem(this.storageKey);
    if (savedSession) {
      this.user = JSON.parse(savedSession);
      this.loadDashboard();
    }
  }

  submitAuth(): void {
    this.loading = true;
    this.clearNotice();

    const endpoint = this.authMode === 'login' ? 'login' : 'signup';
    const body =
      this.authMode === 'login'
        ? { email: this.authForm.email, password: this.authForm.password }
        : this.authForm;

    this.http.post<ApiResponse<AuthUser>>(`${this.apiUrl}/auth/${endpoint}`, body).subscribe({
      next: (response) => {
        this.user = response.data;
        localStorage.setItem(this.storageKey, JSON.stringify(response.data));
        this.showNotice(response.message || 'Welcome back.', 'success');
        this.loadDashboard();
      },
      error: (error) => this.showNotice(error.error?.message || 'Authentication failed.', 'error'),
      complete: () => {
        this.loading = false;
      },
    });
  }

  logout(): void {
    const headers = this.authHeaders();
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).subscribe({ error: () => undefined });
    this.user = null;
    this.exercises = [];
    this.workouts = [];
    this.report = null;
    localStorage.removeItem(this.storageKey);
    this.showNotice('Logged out successfully.', 'success');
  }

  loadDashboard(): void {
    this.loadExercises();
    this.loadWorkouts();
    this.loadReport();
  }

  loadExercises(): void {
    this.http.get<ApiResponse<Exercise[]>>(`${this.apiUrl}/exercises`, { headers: this.authHeaders() }).subscribe({
      next: (response) => {
        this.exercises = response.data;
      },
      error: (error) => this.handleApiError(error, 'Could not load exercises. Seed the backend database first.'),
    });
  }

  loadWorkouts(): void {
    const query = this.statusFilter ? `?status=${this.statusFilter}` : '';
    this.http.get<ApiResponse<Workout[]>>(`${this.apiUrl}/workouts${query}`, { headers: this.authHeaders() }).subscribe({
      next: (response) => {
        this.workouts = response.data;
      },
      error: (error) => this.handleApiError(error, 'Could not load workouts.'),
    });
  }

  loadReport(): void {
    this.http.get<ApiResponse<ProgressReport>>(`${this.apiUrl}/workouts/reports/progress`, { headers: this.authHeaders() }).subscribe({
      next: (response) => {
        this.report = response.data;
      },
      error: (error) => this.handleApiError(error, 'Could not load progress report.'),
    });
  }

  addExerciseLine(): void {
    this.workoutForm.exercises.push(this.newExerciseLine());
  }

  removeExerciseLine(index: number): void {
    this.workoutForm.exercises.splice(index, 1);
  }

  createWorkout(): void {
    this.loading = true;
    this.clearNotice();

    const payload = {
      ...this.workoutForm,
      scheduledDate: new Date(this.workoutForm.scheduledDate).toISOString(),
      exercises: this.workoutForm.exercises.map((line) => ({
        exercise: line.exercise,
        sets: Number(line.sets),
        repetitions: Number(line.repetitions),
        weight: Number(line.weight || 0),
      })),
    };

    this.http.post<ApiResponse<Workout>>(`${this.apiUrl}/workouts`, payload, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.workoutForm = this.newWorkoutForm();
        this.showNotice('Workout created.', 'success');
        this.loadWorkouts();
      },
      error: (error) => this.handleApiError(error, 'Could not create workout.'),
      complete: () => {
        this.loading = false;
      },
    });
  }

  setWorkoutStatus(workout: Workout, status: WorkoutStatus): void {
    this.http
      .put<ApiResponse<Workout>>(
        `${this.apiUrl}/workouts/${workout._id}`,
        { status },
        { headers: this.authHeaders() },
      )
      .subscribe({
        next: () => {
          this.showNotice(`Workout marked ${status}.`, 'success');
          this.loadWorkouts();
          this.loadReport();
        },
        error: (error) => this.handleApiError(error, 'Could not update workout.'),
      });
  }

  deleteWorkout(workout: Workout): void {
    this.http.delete(`${this.apiUrl}/workouts/${workout._id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.showNotice('Workout deleted.', 'success');
        this.loadWorkouts();
        this.loadReport();
      },
      error: (error) => this.handleApiError(error, 'Could not delete workout.'),
    });
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.user?.accessToken || ''}`,
    });
  }

  private handleApiError(error: HttpErrorResponse, fallback: string): void {
    if (error.status === 401) {
      this.user = null;
      localStorage.removeItem(this.storageKey);
      this.showNotice('Your session expired. Please log in again.', 'error');
      return;
    }

    this.showNotice(error.error?.message || fallback, 'error');
  }

  private showNotice(message: string, type: NoticeType): void {
    this.notice = message;
    this.noticeType = type;
  }

  private clearNotice(): void {
    this.notice = '';
  }

  private newWorkoutForm(): { name: string; description: string; scheduledDate: string; exercises: WorkoutLine[] } {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());

    return {
      name: '',
      description: '',
      scheduledDate: tomorrow.toISOString().slice(0, 16),
      exercises: [this.newExerciseLine()],
    };
  }

  private newExerciseLine(): WorkoutLine {
    return {
      exercise: '',
      sets: 3,
      repetitions: 10,
      weight: 0,
    };
  }
}
