import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/home";
import AiOps from "./pages/ai-ops";
import Gtm from "./pages/gtm";
import HowWeWork from "./pages/how-we-work";
import WhoItsFor from "./pages/who-its-for";
import Audit from "./pages/audit";
import Contact from "./pages/contact";
import Booking from "./pages/booking";
import Score from "./pages/score";
import Calculator from "./pages/calculator";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import { useEffect } from "react";

function Router() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ai-ops" component={AiOps} />
      <Route path="/gtm" component={Gtm} />
      <Route path="/how-we-work" component={HowWeWork} />
      <Route path="/who-its-for" component={WhoItsFor} />
      <Route path="/audit" component={Audit} />
      <Route path="/contact" component={Contact} />
      <Route path="/booking" component={Booking} />
      <Route path="/score">
        {() => <Score key={pathname} />}
      </Route>
      <Route path="/calculator" component={Calculator} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
