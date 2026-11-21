export function EstadoError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex animate-fade-up items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-4 text-rose-700">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-500 text-sm font-black text-white">!</span>
      <p className="pt-0.5 font-medium">{message}</p>
    </div>
  )
}
