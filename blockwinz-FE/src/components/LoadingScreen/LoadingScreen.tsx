import { FunctionComponent } from "react";

const LoadingScreen: FunctionComponent = () => {
    return ( 
        <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
     );
}
 
export default LoadingScreen;