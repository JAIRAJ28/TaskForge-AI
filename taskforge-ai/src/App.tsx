import "./App.css";
import AuthRoutes from "./Pages/Routes/AuthRoutes";
import { GlobalToaster } from "./Utils/hooks/sonToast";
function App() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className=" inset-0 opacity-25
         [background-image:linear-gradient(to_right,rgba(150,170,190,.08)_1px,transparent_1px),
         linear-gradient(to_bottom,rgba(150,170,190,.08)_1px,transparent_1px)] [background-size:32px_32px]
          [mask-image:radial-gradient(70%_50%_at_50%_40%,black,transparent)]" />
        <div className="absolute -left-24 -top-24 h-[22rem] w-[22rem] rounded-full 
        blur-[60px] bg-[radial-gradient(closest-side,rgba(124,140,255,0.45),transparent_65%)]
         animate-[float-a_11s_ease-in-out_infinite]" />
        <div className="absolute right-0 bottom-2 h-[20rem] 
        w-[20rem] rounded-full blur-[60px] bg-[radial-gradient(closest-side,rgba(155,229,255,0.35),transparent_65%)] 
        animate-[float-b_14s_ease-in-out_infinite]" />
        <div className="absolute left-1/2 top-[35%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full blur-[60px] bg-[radial-gradient(closest-side,rgba(90,169,230,0.28),transparent_65%)] animate-[float-c_18s_ease-in-out_infinite]" />
      </div>
      <AuthRoutes/>
      <GlobalToaster /> 
    </>
  );
}

export default App;


