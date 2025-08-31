export const mockExpressResponse = {
  status: () => {
    return {
      send: (obj: any) => obj,
    }
  },
  sendStatus: (status: number) => status
}
