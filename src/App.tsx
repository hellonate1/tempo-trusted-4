import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import HomePage from "./components/home";
import ProductPage from "./pages/product/[id]";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ProfileDebug from "./pages/ProfileDebug";
import WriteReview from "./pages/WriteReview";
import DatabaseTest from "./components/DatabaseTest";
import DebugProfile from "./components/DebugProfile";
import Header from "./components/Header";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile-debug/:username" element={<ProfileDebug />} />
          <Route path="/write-review" element={<WriteReview />} />
          <Route path="/database-test" element={<DatabaseTest />} />
          <Route path="/debug-profile" element={<DebugProfile />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </div>
    </Suspense>
  );
}

export default App;
