import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserPosition {
  MANAGER = 'manager',
  ACCOUNTANT = 'accountant',
  HR = 'hr',
  FINANCE_MANAGER = 'finance_manager',
  SALES_SPECIALIST = 'sales_specialist',
  WAREHOUSEMAN = 'warehouseman',
  DIRECTOR = 'director',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  position: UserPosition;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  otpCode: string | null;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
