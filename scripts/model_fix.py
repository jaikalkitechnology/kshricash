# Temporary script to check your models
from app.models_complete import Base
from sqlalchemy import inspect

for mapper in Base.registry.mappers:
    table = mapper.class_.__table__
    fks = {}
    for fk in table.foreign_keys:
        target = fk.column.table.name
        if target in fks:
            fks[target] += 1
        else:
            fks[target] = 1

    for target, count in fks.items():
        if count > 1:
            print(f"{table.name} has {count} FKs to {target}")