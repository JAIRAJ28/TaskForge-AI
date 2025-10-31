import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginCardUI from "../login";
import RegisterCardUI from "../registration";
import PrivateRoute from "./ProtectedRoute";
import DashboardShell from "../DashboardShell";
import Navbar from "../Navbar";

const ProjectsHome = lazy(() =>
  import("../ProjectHome").then((m) => ({ default: m.ProjectsHome }))
);
const TasksBoardPage = lazy(() => import("../ProjectPage/TaskBoardPage"));


const MembersPage = lazy(() =>
  import("../ProjectPage/MembersPage"))
const AiHome = lazy(() => import("../ProjectPage/AiHome"));


const AuthRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="text-center mt-10 text-[#9be5ff]">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginCardUI />} />
        <Route path="/auth/register" element={<RegisterCardUI />} />

        <Route element={<PrivateRoute />}>
          <Route element={<DashboardShell />}>
            <Route path="/dashboard" element={<ProjectsHome />} />

            {/* Navbar should render an <Outlet/> inside to nest these routes */}
            <Route path="/dashboard/:projectId" element={<Navbar />}>
              <Route index element={<Navigate to="tasks" replace />} />
              <Route path="tasks" element={<TasksBoardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="ai" element={<AiHome />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AuthRoutes;
