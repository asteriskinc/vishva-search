// components/Logo.tsx
export default function Logo() {
    return (
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Vishva
        </h1>
        <p className="text-default-500 mt-2">
          Your AI-powered search assistant
        </p>
      </div>
    );
  }