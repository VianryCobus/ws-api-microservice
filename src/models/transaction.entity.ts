import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

// export enum WinLoss {
//   WIN = 1,
//   LOSE = 0,
//   DRAW = 2,
//   WINHALF = 3,
//   LOSEHALF = 4,
// }

// export enum Status {
//   PENDING = -1,
//   ACCEPTED = 0,
//   REJECTED = 1,
//   CANCELLED = 4,
//   REFUNDED = 5,
// }

// export enum Source {
//   MOBILE = 1,
//   DESKTOP = 0,
// }

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'bigint',
  })
  transId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ticketBetId: string;

  @Column({
    type: 'timestamp'
  })
  sDate: Date;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  bAmt: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  wAmt: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  payout: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0
  })
  creditDeducted: number;

  // @Column({
  //   type: 'enum',
  //   enum: WinLoss,
  // })
  // winloss: WinLoss;

  @Column({
    type: 'varchar',
    length: 255,
  })
  winloss: string;

  // @Column({
  //   type: 'enum',
  //   enum: Status,
  // })
  // status: Status;

  @Column({
    type: 'varchar',
    length: 255,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ip: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  odds: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  commPerc: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  comm: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  game: string;

  // @Column({
  //   type: 'enum',
  //   enum: Source,
  // })
  // source: Source

  @Column({
    type: 'varchar',
    length: 255,
  })
  source: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn()
  user: User

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}