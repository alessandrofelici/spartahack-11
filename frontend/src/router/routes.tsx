import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import BestPractices from '../pages/best-practices';
import Information from '../pages/information';
import SlippageEstimates from '../pages/slippage-estimates';
import Sources from '../pages/sources';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Information /> },
      { path: "best-practices", element: <BestPractices /> },
      { path: "slippage-estimates", element: <SlippageEstimates /> },
      { path: "sources", element: <Sources /> },
    ],
  },
]);