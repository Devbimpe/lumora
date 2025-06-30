
import Link from 'next/link';
import Image from 'next/image';
export function Header(){
  return(
    <header>
    <nav className="topnav">
      <div>
        <Link href={{pathname: '/'}}>
        <Image
        src="/Lumoralogo.jpeg" 
        alt="LumoraLogo"
        width={"200"} height={"80"}
        />
        </Link>
      </div>
      <div className="right">
        <Link href={{pathname: '/'}} className="about" >About</Link>
        {/* <Link href={{pathname: '/'}} className="trainingmodule">Training Module</Link> */}
        <Link href="/training-module" className="trainingmodule">Training Module</Link>
        <Link href={{pathname: 'login'}} className='login'>Login</Link>
      </div>
    </nav>
    </header>
  );
}