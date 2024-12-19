import dynamicIconImports from "lucide-react/dynamicIconImports"

export function getMediaPrompt() {
  const iconNames = Object.keys(dynamicIconImports)

  return `
    ### Gradients:
    Whenever you're generating gradients:
    - Provide CSS gradients for light and dark modes
    - For dark mode, use toned colors, not too bright or vibrant
    - For light mode, use more vibrant and bright colors
    - Make sure generated gradients are cohesive, but different from each other.

    ### Icons
    Whenever generating icons, choose name from the following dataset:    
    
    <icons>
    ${iconNames.join("\n")}
    </icons>

    !!! DO NOT use any icon name that is not listed in the dataset above !!!

    ### Image position
    Whenever you need to provide image position, it can be "top", "center" or "bottom".
    It's the vertical position of the focal point or main subject in the image.
    So if you provide "top", it means that the main subject is at the top of the image.
  `
}
