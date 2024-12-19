import { Button, ButtonProps } from "@/components/ui/button"
import { useLogin } from "@/lib/auth/use-login"

export const LoginButton = ({
  variant = "outline",
  size = "default",
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}) => {
  const { login } = useLogin()

  return (
    <Button variant={variant} size={size} onClick={login}>
      Connect
    </Button>
  )
}
