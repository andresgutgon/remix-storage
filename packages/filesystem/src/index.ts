import { Driver } from "@remix-storage/core"

export class Filesystem implements Driver {
  public hello() {
    return "HOLA"
  }

}


