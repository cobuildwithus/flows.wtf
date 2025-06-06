export const BgGradient = () => {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-12 -z-10 transform-gpu blur-3xl max-sm:hidden">
      <div
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
        }}
        className="aspect-[1155/678] w-full max-w-none bg-gradient-to-br from-primary to-secondary opacity-15 dark:opacity-25 md:w-11/12 lg:w-[72.1875rem]"
      />
    </div>
  )
}
