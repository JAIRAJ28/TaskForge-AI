import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './Utils/hooks/useSocket.tsx';
const qc = new QueryClient()
createRoot(document.getElementById('root')!).render(
    <SocketProvider>
   {/* <QueryClientProvider client={qc}> */}
      <BrowserRouter>
          <App />
      </BrowserRouter>
    {/* </QueryClientProvider> */}
    </SocketProvider>
)
