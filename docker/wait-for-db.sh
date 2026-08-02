#!/bin/sh

echo "Waiting for MySQL..."

until nc -z mysql 3306
do
  echo "MySQL is unavailable - sleeping"
  sleep 2
done

echo "MySQL is up!"