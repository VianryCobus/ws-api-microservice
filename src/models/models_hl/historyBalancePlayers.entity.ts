import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MasterPlayersMysqlHl } from "./masterPlayers.entity";

@Entity('history_balance_players')
export class HistoryBalancePlayersMysqlHL {
  @PrimaryGeneratedColumn()
  id_history_balance_players: number;

  @Column()
  players_id: number;

  @Column()
  transactions_types_id: number;

  @Column()
  no_transactions: string;

  @Column()
  aggregator_id: number;

  @Column()
  amount_balance_players: number;

  @Column()
  current_balance_players: number;

  @Column()
  datetime_balance_players: Date;

  @Column()
  note_balance_players: string;

  @ManyToOne(() => MasterPlayersMysqlHl,(mpmh) => mpmh.hbpmh)
  @JoinColumn({ name:"players_id", referencedColumnName:"id_players" })
  mpmh: MasterPlayersMysqlHl
}