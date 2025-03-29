import SignUpForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-3xl font-bold mb-8 text-center">Join Brain Rot Dictionary</h1>
        <SignUpForm />
      </div>
    </div>
  )
}

