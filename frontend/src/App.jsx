import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 mins
      refetchOnWindowFocus: false, // Prevent aggressive refetching when switching tabs
    }
  }
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>App</div>
    </QueryClientProvider>
  )
}

export default App