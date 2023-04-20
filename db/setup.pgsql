drop table if exists contracts;

create table contracts (
    id SERIAL, 
    signer varchar(42) NOT NULL, 
    contract varchar(42) NOT NULL,  
    arbiter varchar(42) NOT NULL,
    beneficiary varchar(42) NOT NULL, 
    value bigint NOT NULL, 
    created_at timestamp default current_timestamp, 
    primary key (id)
);