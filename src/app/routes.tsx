import { createBrowserRouter } from "react-router";
import Root from "./layout";
import Home from "./pages/Home";
import { Quran, TopicPage, LessonPage, NotFoundBlock } from "./pages/Quran";
import { Academy, CourseDetail, CourseLessonPage } from "./pages/Academy";
import { Questions, Answer, AskImam } from "./pages/Questions";
import { Podcasts, EpisodePage } from "./pages/Podcasts";
import { Shop, ProductPage } from "./pages/Shop";
import Premium from "./pages/Premium";
import Beginner from "./pages/Beginner";
import Login from "./pages/Login";
import Info from "./pages/Info";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Ustaz from "./pages/Ustaz";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "quran", Component: Quran },
      { path: "quran/:topic", Component: TopicPage },
      { path: "quran/:topic/:n", Component: LessonPage },
      { path: "academy", Component: Academy },
      { path: "academy/:slug", Component: CourseDetail },
      { path: "academy/:slug/:n", Component: CourseLessonPage },
      { path: "questions", Component: Questions },
      { path: "questions/ask", Component: AskImam },
      { path: "questions/:id", Component: Answer },
      { path: "podcasts", Component: Podcasts },
      { path: "podcasts/:id", Component: EpisodePage },
      { path: "shop", Component: Shop },
      { path: "shop/:id", Component: ProductPage },
      { path: "premium", Component: Premium },
      { path: "beginner", Component: Beginner },
      { path: "login", Component: Login },
      { path: "profile", Component: Profile },
      { path: "support", Component: Support },
      { path: "ustaz", Component: Ustaz },
      { path: "about", element: <Info page="about" /> },
      { path: "contact", element: <Info page="contact" /> },
      { path: "privacy", element: <Info page="privacy" /> },
      { path: "terms", element: <Info page="terms" /> },
      { path: "*", Component: NotFoundBlock },
    ],
  },
]);
