import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Balance } from "./historyBalance.entity";
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
    unique: true,
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
    nullable: true,
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
    default: 0,
    nullable: true,
  })
  creditDeducted: number;

  // @Column({
  //   type: 'enum',
  //   enum: WinLoss,
  // })
  // winloss: WinLoss;

  @Column({
    nullable: true,
  })
  winloss: number;

  // @Column({
  //   type: 'enum',
  //   enum: Status,
  // })
  // status: Status;

  @Column()
  status: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
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
    nullable: true,
  })
  commPerc: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    nullable: true,
  })
  comm: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  game: string;

  // @Column({
  //   type: 'enum',
  //   enum: Source,
  // })
  // source: Source

  @Column({
    nullable: true,
  })
  source: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ep: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn()
  user: User

  @OneToOne(() => Balance, (balance) => balance.transaction)
  balance: Balance

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}