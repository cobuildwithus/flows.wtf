import Compressor from "compressorjs"

export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 2000,
      maxHeight: 2000,
      success: (result) => resolve(result as File),
      error: reject,
    })
  })
}
