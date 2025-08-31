import {v4} from "uuid";
import {Recipient} from "../domain/aggregates/Recipient";
import {SaveRecipient} from "../usecases/notification/SaveRecipient";
import {InMemoryRecipientRepository} from "./adapters/repositories/InMemoryRecipientRepository";
import {eventDispatcherMock} from "./adapters/gateways/EventDispatcherMock";

describe("Unit - SaveRecipient", () => {
  let saveRecipient: SaveRecipient;

  const db = new Map<string, Recipient>()

  beforeAll(() => {
    const recipientRepository = new InMemoryRecipientRepository(db);
    saveRecipient = new SaveRecipient(
      recipientRepository,
      eventDispatcherMock()
    )
  })


  it("Should create a recipient", async () => {
    const result = await saveRecipient.execute({
      email: "hello@alze.com",
      phone: "123",
      id: v4(),
    })
    const recipient = db.get(result.id);
    expect(recipient.id).toEqual(result.id);
    expect(recipient.props.email).toEqual(result.props.email);
    expect(recipient.props.phone).toEqual(result.props.phone);
  })
})
