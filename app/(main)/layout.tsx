import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};


const MainLayout = ({children}:Props) => {
    //Redirect User that comes first
  return  (
 <div className="container mx-auto mt-24 mb-20">{children}</div>

  )
 

  
  
}

export default MainLayout