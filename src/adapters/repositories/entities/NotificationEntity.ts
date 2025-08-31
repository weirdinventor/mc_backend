import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { LiveEntity } from "./LiveEntity";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryColumn()
  id: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  title: string;

  @Column({
    nullable: false,
    type: "varchar",
  })
  message: string;

  @ManyToOne(() => LiveEntity, (live) => live.notifications)
  live: LiveEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
