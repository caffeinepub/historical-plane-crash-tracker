import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AddCrashPage from './pages/AddCrashPage';
import CrashDetailPage from './pages/CrashDetailPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const addCrashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-crash',
  component: AddCrashPage,
});

const crashDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crash/$id',
  component: CrashDetailPage,
});

const routeTree = rootRoute.addChildren([indexRoute, addCrashRoute, crashDetailRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
