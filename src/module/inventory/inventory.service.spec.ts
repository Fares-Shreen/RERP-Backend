import { Test, TestingModule } from '@nestjs/testing';
import { InventoryTransactionService } from './inventory.service';

describe('InventoryTransactionService', () => {
  let service: InventoryTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryTransactionService],
    }).compile();

    service = module.get<InventoryTransactionService>(InventoryTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
