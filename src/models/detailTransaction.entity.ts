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
  })
  sDate: Date;

  @Column({
    type: 'timestamp',
  })
  tDate: Date;

  @Column({
    type: 'timestamp',
  })
  kDate: Date;

  @Column({
    type: 'timestamp',
  })
  aDate: Date;

  @Column({
    type: 'timestamp',
  })
  pDate: Date;

  @Column({
    type: 'varchar',
    length: 255,
  })
  user: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  sport: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  league: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  home: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  away: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  sport_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  league_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  home_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  away_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  live: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  homeScore: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  awayScore: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ft: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  oddsType: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  game: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  info: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  odds: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  side: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  side_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  othersgame: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  othersgame_en: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  bAmt: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  wAmt: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  tresult: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  fhscore: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ftscore: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  fg: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  lg: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  ip: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  isMobile: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  commision: string;

  @Column({
    type: 'varchar',
    length: 255,
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