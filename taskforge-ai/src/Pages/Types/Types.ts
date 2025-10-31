export interface AuthResponse{
  error: boolean;
  message: string;
  user?: { id: string; name: string };
  token?: string; 
}


export interface Member {
  userId: string;
  role: "owner" | "member" | "admin"; 
  _id: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  members: Member[];
  createdAt: string; 
  updatedAt: string; 
  __v: number;
}

export interface ProjectListResponse {
  error: boolean;
  message?: string;      
  project?: Project;
  projects?: Project[];
}



//  task types ////////////////


export type Priority = "low" | "medium" | "high";
export type StatusKey = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  assignees?: string[];
  due?: string;
  priority?: Priority;
  points?: number;
  status: StatusKey;
};


export interface TaskItem {
  _id: string;
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
export interface TaskListResponse {
  error: boolean;
  total: number;
  page: number;
  limit: number;
  tasks: TaskItem[];
}


export type CreateTaskPayload = {
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
};

export type CreateTaskModalProps = {
  open: boolean;
  projectId: string;
  columnId: string | null;
  onClose: () => void;
  onCreated?: (task: any) => void;
  createTask: (p: CreateTaskPayload) => Promise<{ error: boolean; message?: string; task?: any }>;
};
export interface CreateTaskResponse {
  error: boolean;
  message: string;
  task?: {
    _id: string;
    projectId: string;
    columnId: string;
    title: string;
    description?: string;
    order: number;
    difficulty: string;
    createdAt: string;
    updatedAt: string;
  };
}

export type Role = "owner" | "member";
export type MemberRow = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
};




export interface AddMemberResponse {
  error: boolean;
  message: string;
  members?: {
    userId: {
      _id: string;
      name: string;
      password?: string;
    };
    role: string;
    _id: string;
  }[];
}