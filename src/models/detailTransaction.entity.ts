import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Transaction } from "./transaction.entity";

@Entity('DetailTransactions')
export class DetailTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  @Index()
  ticketBetId: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  sDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  tDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  kDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  aDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  pDate: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  user: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sport: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  league: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  home: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  away: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sport_en: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  league_en: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  home_en: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  away_en: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  live: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  homeScore: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  awayScore: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ft: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  oddsType: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  game: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  info: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  odds: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  side: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  side_en: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  othersgame: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  othersgame_en: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  bAmt: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  wAmt: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  tresult: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fhscore: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ftscore: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fg: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lg: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ip: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  isMobile: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
  })
  commision: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.detailtrx)
  @JoinColumn({ name:"ticketBetId", referencedColumnName: "ticketBetId"  })
  transactions: Transaction[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}