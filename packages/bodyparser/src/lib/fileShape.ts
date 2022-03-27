export class FileShape {
  public filepath: string | null = null
  public filename = ""
  constructor(
    public fieldName: string,
    public type: string,
    public size: number
  ) {}
  public setSize(size: number) {
    this.size = size
  }
  set name(name: string) {
    this.filename = name
  }
  get name(): string {
    return this.filename
  }
  set filePath(filepath: string) {
    this.filepath = filepath
  }
}
