import { SignedIn, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-300">
      <h1 className="text-xl font-bold uppercase">Cluj True Fire</h1>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
