import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('history_balance_players')
export class HistoryBalancePlayersMysqlLocal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  players_id: number;

  @Column()
  transactions_types_id: number;

  @Column()
  no_transactions: string;

  @Column()
  aggregator_id: number;

  @Column()
  datetime_balance_players: Date;

  @Column()
  amount_balance_players: number;

  @Column()
  current_balance_players: number;

  @Column()
  note_balance_players: string;
}